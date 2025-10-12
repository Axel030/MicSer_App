import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Company } from './company.entity';

@Entity({ name: 'enterprise_jobs' })
export class EnterpriseJob {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  uuid: string;

  @ManyToOne(() => Company, (company) => company.jobs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id', referencedColumnName: 'id' })
  company: Company;

  @Column({ type: 'int' })
  company_id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  short_description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'boolean', default: false })
  urgency: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  job_type: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  location_name: string;

  @Column({ type: 'time', nullable: true })
  start_time: string;

  @Column({ type: 'time', nullable: true })
  end_time: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  salary: number;

  @Column({ type: 'varchar', length: 20, default: 'published' })
  status: string;

  @Column({ type: 'boolean', default: true })
  visibility: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @BeforeInsert()
  generateUuid() {
    this.uuid = uuidv4();
  }
}
