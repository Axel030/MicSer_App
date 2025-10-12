import { Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Company } from './entities/company.entity';
import { EnterpriseJob } from './entities/enterprise-job.entity';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern({ cmd: 'create_company' })
    async createUser(@Payload() data: Partial<Company>): Promise<Company> {
      return this.appService.createCompany(data);
    }
  @MessagePattern({ cmd: 'create_enterprise_job' })
    async createJob(@Payload() data: Partial<EnterpriseJob>): Promise<EnterpriseJob> {
      return this.appService.createJob(data);
    }

}
