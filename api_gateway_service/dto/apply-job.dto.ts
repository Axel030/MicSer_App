import { IsString, IsOptional } from 'class-validator';

export class ApplyJobDto {
  @IsString()
  job_uuid: string;

  @IsString()
  user_unique_id: string;

  @IsOptional()
  @IsString()
  message?: string;
}