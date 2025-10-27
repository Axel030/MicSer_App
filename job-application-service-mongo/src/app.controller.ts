import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern({ cmd: 'create_job_log' })
  async createJobLog(@Payload() data: any) {
    return this.appService.createJobLog(data);
  }

  @MessagePattern({ cmd: 'get_user_logs' })
  async getUserLogs(@Payload() data: { user_unique_id: string }) {
    return this.appService.getLogsForUser(data.user_unique_id);
  }
}
