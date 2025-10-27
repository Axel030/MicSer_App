import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JobApplicationLog } from './schemas/job-application-log.schema';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(JobApplicationLog.name)
    private readonly logModel: Model<JobApplicationLog>,
  ) {}

   async createJobLog(data: any) {
    const log = new this.logModel({
      application_id: data.application_id,
      user_unique_id: data.user_unique_id,
      job_uuid: data.job_uuid,
      event: data.event,
      message: data.message,
      created_at: new Date(),
    });
    return await log.save();
  }

  async getLogsForUser(user_unique_id: string) {
    const logs = await this.logModel.find({ user_unique_id }).sort({ createdAt: -1 });
    return { status: 'success', code: 200, data: logs };
  }
}
