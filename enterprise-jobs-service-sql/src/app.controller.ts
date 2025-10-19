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

}
