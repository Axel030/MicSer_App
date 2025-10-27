import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { JobApplication } from './entity/job-application.entity';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(JobApplication)
    private readonly jobAppRepo: Repository<JobApplication>,
    private readonly dataSource: DataSource,
    @Inject('ENTERPRISE_JOBS_SQL') private readonly enterpriseJobsSqlClient: ClientProxy,
    @Inject('JOB_APPLICATION_MONGO') private readonly jobAppMongoClient: ClientProxy,
  ) {}


  // Helper: obtener job con fechas via RPC
  async getJobByUuid(job_uuid: string) {
    const resp = await lastValueFrom(this.enterpriseJobsSqlClient.send({ cmd: 'get_job_by_uuid' }, { uuid: job_uuid }));
    return resp;
  }

  // Verificar solapamiento (SQL query)
  async userHasOverlap(user_unique_id: string, newStart: Date, newEnd: Date) {
    const qb = this.jobAppRepo.createQueryBuilder('a')
      .innerJoin('enterprise_jobs', 'j', 'a.job_uuid = j.uuid') // enterprise_jobs tabla externa; requiere permisos cross-db? this assumes same DB schema or use RPC
      .where('a.user_unique_id = :user', { user: user_unique_id })
      .andWhere("a.status IN ('pending','accepted')")
      .andWhere('j.start_at < :newEnd AND j.end_at > :newStart', { newStart, newEnd })
      .limit(1);

    const row = await qb.getRawOne();
    return !!row;
  }


  // Alternativa si no puedes hacer join (si jobs están en otro servicio):
  // obtener jobDates via RPC (getJobByUuid) y luego buscar aplicaciones del user y por cada aplicación obtener job dates via RPC (could be expensive). Better: job-application-service_sql should be able to read jobs table or job snapshot provided.

  async applyToJob(data: { job_uuid: string; user_unique_id: string; message?: string }) {
    // 1) get job details (start/end)
    try {
    let jobResp;
    try {
      jobResp = await this.getJobByUuid(data.job_uuid);
    } catch (err) {
      console.error('❌ Error al obtener job via RPC:', err);
      return { status: 'error', code: 500, message: 'No se pudo comunicar con el servicio de empleos' };
    }

    if (!jobResp || jobResp.status === 'error') {
      return { status: 'error', code: HttpStatus.NOT_FOUND, message: 'Trabajo no encontrado' };
    }
    const job = jobResp.data;
    const jobStart = new Date(job.start_at);
    const jobEnd = new Date(job.end_at);

    // 2) check overlap
    // Option A: if enterprise_jobs table accessible from this DB, do SQL JOIN (see userHasOverlap)
    // Option B: if not, ask jobs service for user's existing applications job ranges — but simpler: check local applications and call jobsSql for each to obtain ranges.
    // Here I'll implement Option B (works even if jobs in different DB)

    // get user's pending/accepted applications
    const apps = await this.jobAppRepo.find({
      where: { user_unique_id: data.user_unique_id, status: In(['pending','accepted']) },
    });

    for (const a of apps) {
      // call jobs service to get that job's dates
      const existingJobResp = await this.getJobByUuid(a.job_uuid);
      if (!existingJobResp || existingJobResp.status === 'error') continue; // ignore missing
      const ej = existingJobResp.data;
      if (!ej.start_at || !ej.end_at) continue;
      const s = new Date(ej.start_at);
      const e = new Date(ej.end_at);
      const intersects = (jobStart < e && jobEnd > s); // overlap test
      if (intersects) {
        return {
          status: 'error',
          code: HttpStatus.CONFLICT,
          message: 'Tienes una aplicación/turno confirmado o pendiente que se solapa con este trabajo',
        };
      }
    }

    // 3) if ok, save application
    const application = this.jobAppRepo.create({
      job_uuid: data.job_uuid,
      user_unique_id: data.user_unique_id,
      status: 'pending',
    });
    const saved = await this.jobAppRepo.save(application);

    // 4) publish to mongo logs
    await lastValueFrom(this.jobAppMongoClient.send({ cmd: 'create_job_log' }, {
      application_id: saved.id,
      user_unique_id: data.user_unique_id,
      job_uuid: data.job_uuid,
      event: 'applied',
      message: data.message || 'Gracias por aplicar',
    }));

    return { status: 'success', code: HttpStatus.CREATED, message: 'Aplicación creada', data: saved };
  } 
    catch (err) {
    console.error('💥 Error interno en applyToJob:', err);
    return { status: 'error', code: 500, message: 'Error interno en applyToJob', error: err.message };
  }
}


  async acceptApplicant(job_uuid: string, user_unique_id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1) Lock job row to avoid two companies accepting simultaneously (if job in same DB)
      // If job is in different service, you need an application-level lock (redis lock) or rely on application status checks.

      // 2) Find the application to accept (for this job and user) and lock it
      const appToAccept = await queryRunner.manager.findOne(JobApplication, {
        where: { job_uuid, user_unique_id, status: 'pending' },
        lock: { mode: 'pessimistic_write' },
      });

      if (!appToAccept) {
        await queryRunner.rollbackTransaction();
        return { status: 'error', code: HttpStatus.NOT_FOUND, message: 'Solicitud no encontrada o ya procesada' };
      }

      // 3) Mark accepted
      appToAccept.status = 'accepted';
      appToAccept.accepted_at = new Date();
      await queryRunner.manager.save(appToAccept);

      // 4) Reject other pending applicants for same job (capacity=1 assumed)
      await queryRunner.manager
        .createQueryBuilder()
        .update(JobApplication)
        .set({ status: 'rejected' })
        .where('job_uuid = :job_uuid AND status = :pending AND id != :id', { job_uuid, pending: 'pending', id: appToAccept.id })
        .execute();

      // 5) Optionally update job status in enterprise_jobs (if same DB or via RPC)
      // await this.jobsSqlClient.emit('job_filled', { job_uuid });

      await queryRunner.commitTransaction();

      // 6) Publish events to Mongo (logs) and notification queue
      await lastValueFrom(this.jobAppMongoClient.send({ cmd: 'create_job_log' }, {
        application_id: appToAccept.id,
        user_unique_id,
        job_uuid,
        event: 'accepted',
        message: 'Felicidades, fuiste seleccionado para el trabajo',
      }));

      // publish rejection logs for others
      // get list of rejected apps (you can query them)
      const rejectedApps = await this.jobAppRepo.find({ where: { job_uuid, status: 'rejected' } });
      for (const r of rejectedApps) {
        await lastValueFrom(this.jobAppMongoClient.send({ cmd: 'create_job_log' }, {
          application_id: r.id,
          user_unique_id: r.user_unique_id,
          job_uuid,
          event: 'rejected',
          message: 'Gracias por aplicar. Este empleo ya fue aceptado por otro candidato.',
        }));
      }

      return { status: 'success', code: HttpStatus.OK, message: 'Aplicación aceptada', data: appToAccept };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error('Error accepting applicant', err);
     return { status: 'error', code: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Error interno al aceptar candidato' };
    } finally {
      await queryRunner.release();
    }
  }

  async completeJob(id: number, feedback?: string) {
    const app = await this.jobAppRepo.findOne({ where: { id } });
    if (!app) return { status: 'error', code: 404, message: 'Solicitud no encontrada' };

    app.status = 'completed';
    app.completed_at = new Date();
    app.company_feedback = feedback || null;
    await this.jobAppRepo.save(app);

    await lastValueFrom(this.jobAppMongoClient.send({ cmd: 'create_job_log' }, {
      application_id: app.id,
      user_unique_id: app.user_unique_id,
      job_uuid: app.job_uuid,
      event: 'completed',
      message: 'Trabajo marcado como completado',
    }));
    
    return { status: 'success', code: 200, message: 'Trabajo completado', data: app };
  }

  async getApplicationsByJob(job_uuid: string) {
    return this.jobAppRepo.find({ where: { job_uuid } });
  }
}
