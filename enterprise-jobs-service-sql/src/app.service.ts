import { Injectable,HttpStatus ,Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { EnterpriseJob } from './entities/enterprise-job.entity';
import { ClientProxy } from '@nestjs/microservices';
import { ApiResponse } from './interfaces/api-response.interface';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,

    @InjectRepository(EnterpriseJob)
    private readonly jobRepo: Repository<EnterpriseJob>,

    @Inject('ENTERPRISE_JOBS_MONGO') private readonly enterpriseJobsMongoClient: ClientProxy,
  ) {}

   // ===============================
  //      CREAR COMPAÑÍA
  // ===============================
  async createCompany(data: Partial<Company>): Promise<ApiResponse> {
    try{
    const existing = await this.companyRepo.findOne({
      where: {email: data.email},
    });
    
    if (existing) {
      console.log(`❌ Compañía con email ${data.email} ya existe`);
      return {
        status: 'error',
        code: HttpStatus.CONFLICT,
        message: 'Compañía ya existe',
      };
    }
    const newCompany = this.companyRepo.create(data);
    const savedCompany = await this.companyRepo.save(newCompany);

    console.log(`✅ Compañía ${data.name} creada correctamente`);
    return {
      status: 'success',
      code: HttpStatus.CREATED,
      message: 'Compañía creada correctamente',
      data: savedCompany,
    };
  }
    catch (error) {
      console.error('🔥 Error al crear compañía:', error);
      return {
        status: 'error',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error interno al crear compañía',
      };
    }
  }

  // ===============================
  //      CREAR EMPLEO
  // ===============================
  async createJob(data: Partial<EnterpriseJob>): Promise<ApiResponse> {
    try{
      const job = this.jobRepo.create(data);
      const saved = await this.jobRepo.save(job);
      if(!saved){
        console.log('❌ Error al guardar el empleo');
        return {
          status: 'error',
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error al guardar el empleo',
        };
      }

      // 2️⃣ Emitir evento SOLO con el uuid al microservicio Mongo
        await this.enterpriseJobsMongoClient.emit('enterprise_job_created', {
        uuid: saved.uuid, // 👈 único campo necesario
      });
      
      console.log('📤 Evento emitido: enterprise_job_created ->', saved.uuid);
      return {
        status: 'success',
        code: HttpStatus.CREATED,
        message: 'Empleo creado correctamente',
        data: saved,
      }

    } catch (error) {
        console.error('🔥 Error al crear empleo:', error);
        return {
          status: 'error',
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error interno al crear empleo',
        };
    }
  }

  // ===============================
  //      BUSQUEDA DE TRABAJO
  // ===============================
  async findOne(options: any): Promise<EnterpriseJob | null> {
    return this.jobRepo.findOne(options);
  }

  // ===============================
  //      OBTENER EMPLEO Y COMPAÑÍA
  // ===============================
  async getJobAndCompany(uuid: string): Promise<ApiResponse> {
    try {
      const job = await this.jobRepo.find({ where: { uuid } });
      if (!job)
      {
        console.log (`❌ Trabajo con ID ${uuid} no encontrado`);
        return {
          status : 'error',
          code: HttpStatus.NOT_FOUND,
          message: 'Trabajo no encontrado',
        };
      }

      const profile= await firstValueFrom(
        this.enterpriseJobsMongoClient.send({ cmd : 'get_job_by_uuid' }, {uuid : job[0].uuid})
      );

      return {
        status: 'success',
        code: HttpStatus.OK,
        message: 'Trabajo y compañia obtenidos correctamente',
        data: { job: job[0], profile  },
      }
    } catch (error) {
      console.error('🔥 Error al obtener trabajo con compañia:', error);
      return {
        status: 'error',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error interno al obtener tabajo y compañia',
      };
    }
  }


  // ===============================
  //   OBTENER TODOS LOS EMPLEOS ACTIVOS CON COMPAÑÍA Y DETALLES (SQL + Mongo)
  // ===============================
  async getAllActiveJobs(): Promise<ApiResponse> {
  try {
      // 1️⃣ Obtener todos los empleos publicados y visibles
      const jobs = await this.jobRepo.find({
        where: { status: 'published', visibility: true },
        relations: ['company'], // incluye la relación con la empresa
      });

      if (!jobs.length) {
        return {
          status: 'success',
          code: HttpStatus.OK,
          message: 'No hay empleos activos disponibles',
          data: [],
        };
      }

      // 2️⃣ Para cada empleo, traer su detalle desde Mongo
      const enrichedJobs = await Promise.all(
        jobs.map(async (job) => {
          try {
            const profile = await firstValueFrom(
              this.enterpriseJobsMongoClient.send(
                { cmd: 'get_job_by_uuid' },
                { uuid: job.uuid },
              ),
            );
           return { ...job, details: profile?.data || null };
          } catch (error) {
            console.warn(`⚠️ No se pudo obtener detalles para el empleo ${job.uuid}`);
            return { ...job, details: null };
          }
        }),
      );

      return {
        status: 'success',
        code: HttpStatus.OK,
        message: 'Empleos activos obtenidos correctamente',
        data: enrichedJobs,
      };
    } catch (error) {
      console.error('🔥 Error al obtener empleos activos:', error);
      return {
        status: 'error',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error interno al obtener empleos activos',
      };
    }
  }


  async getJobsPreview(): Promise<ApiResponse> {
  try {
    const jobs = await this.jobRepo.find({
      where: { status: 'published', visibility: true },
      relations: ['company'],
      select: {
        id: true,
        uuid: true,
        title: true,
        short_description: true,
        category: true,
        urgency: true,
        job_type: true,
        salary: true,
        company: {
          name: true
        }
      }
    });

    return {
      status: 'success',
      code: 200,
      message: 'Vista previa de empleos obtenida correctamente',
      data: jobs
    };
  } catch (error) {
    console.error('❌ Error en getJobsPreview:', error);
    return {
      status: 'error',
      code: 500,
      message: 'Error al obtener vista previa de empleos'
    };
  }
}

}