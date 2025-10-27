import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern({ cmd: 'apply_to_job' })
  async applyToJob(@Payload() data) {
    return this.appService.applyToJob(data);
  }

  @MessagePattern({ cmd: 'accept_applicant' })
  async acceptApplicant(@Payload() data: { job_uuid: string ; user_unique_id: string}) {
    return this.appService.acceptApplicant( data.job_uuid, data.user_unique_id);
  }

  @MessagePattern({ cmd: 'complete_job' })
  async completeJob(@Payload() data: { id: number; feedback?: string }) {
    return this.appService.completeJob(data.id, data.feedback);
  }

  @MessagePattern({ cmd: 'get_applications_by_job' })
  async getApplications(@Payload() data: { job_uuid: string }) {
    return this.appService.getApplicationsByJob(data.job_uuid);
  }
}
