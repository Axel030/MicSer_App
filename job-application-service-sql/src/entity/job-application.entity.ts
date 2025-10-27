import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('job_applications')
export class JobApplication {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  job_uuid: string; // FK hacia enterprise_jobs

  @Column({ type: 'uuid' })
  user_unique_id: string; // FK hacia usuarios

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string; // pending | accepted | rejected | completed

  @CreateDateColumn({ name: 'applied_at' })
  applied_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  accepted_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @Column({ type: 'text', nullable: true })
  company_feedback: string | null;
}
