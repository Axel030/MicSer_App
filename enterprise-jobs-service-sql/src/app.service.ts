import { Injectable,HttpStatus ,Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { EnterpriseJob } from './entities/enterprise-job.entity';
import { ClientProxy } from '@nestjs/microservices';
import { ApiResponse } from './interfaces/api-response.interface';

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
}
