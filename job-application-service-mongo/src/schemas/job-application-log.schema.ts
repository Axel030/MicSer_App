import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'job_application_logs', timestamps: true })
export class JobApplicationLog extends Document {
  @Prop({ required: true })
  application_id: number;

  @Prop({ required: true })
  user_unique_id: string;

  @Prop({ required: true })
  job_uuid: string;

  @Prop({ required: true })
  event: string; // applied | accepted | rejected | completed

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  seen: boolean;
}

export const JobApplicationLogSchema = SchemaFactory.createForClass(JobApplicationLog);
