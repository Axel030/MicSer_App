import { Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Company } from './entities/company.entity';
import { EnterpriseJob } from './entities/enterprise-job.entity';
import { ApiResponse } from './interfaces/api-response.interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern({ cmd: 'create_company' })
    async createUser(@Payload() data: Partial<Company>): Promise<ApiResponse> {
      return this.appService.createCompany(data);
    }
  @MessagePattern({ cmd: 'create_enterprise_job' })
    async createJob(@Payload() data: Partial<EnterpriseJob>): Promise<ApiResponse> {
      return this.appService.createJob(data);
    }
  @MessagePattern({ cmd: 'get_job_by_uuid' })
    async getJobByUuid(@Payload() data :{ uuid:string}) {
    try {
        
      const job = await this.appService.findOne({
        where: { uuid: data.uuid },
      });

      if (!job) {
      return { status: 'error', code: 404, message: 'Trabajo no encontrado' };
      }

      return { status: 'success', data: job };
    } catch (error) {
      console.error('❌ Error en get_job_by_uuid:', error);
      return { status: 'error', code: 500, message: 'Error interno al obtener el trabajo' };
    }
  }
  //obtener trabajo y compañia
  @MessagePattern ({ cmd : 'get_enterprise_job' })
  async getJobandCompany(@Payload() data: { uuid: string}): Promise<ApiResponse> {
    return this.appService.getJobAndCompany(data.uuid);
  }
  //obtener todos los trabajos activos
  @MessagePattern({ cmd: 'get_all_active_jobs' })
  async getAllActiveJobs(): Promise<ApiResponse> {
    return this.appService.getAllActiveJobs();
  }

  @MessagePattern({ cmd: 'get_jobs_preview' })
  async getJobsPreview(): Promise<ApiResponse> {
    return this.appService.getJobsPreview();
  }
}
