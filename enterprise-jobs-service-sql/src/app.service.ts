import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { EnterpriseJob } from './entities/enterprise-job.entity';
import { ClientProxy } from '@nestjs/microservices';


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
  async createCompany(data: Partial<Company>) {
    const newCompany = this.companyRepo.create(data);
    const saved = await this.companyRepo.save(newCompany);
    return saved; // no tiene UUID, solo id normal
  }

  // ===============================
  //      CREAR EMPLEO
  // ===============================
  async createJob(data: Partial<EnterpriseJob>) {
    // 1️⃣ Crear empleo en SQL
    const job = this.jobRepo.create(data);
    const saved = await this.jobRepo.save(job);

    // 2️⃣ Emitir evento SOLO con el uuid al microservicio Mongo
    await this.enterpriseJobsMongoClient.emit('enterprise_job_created', {
      uuid: saved.uuid, // 👈 único campo necesario
    });

    console.log('📤 Evento emitido: enterprise_job_created ->', saved.uuid);

    return saved;
  }

}
