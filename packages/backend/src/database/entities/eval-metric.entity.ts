import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MetricType, MetricScope } from '@eva/shared';

@Entity('eval_metrics')
export class EvalMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: MetricType,
  })
  type: MetricType;

  @Column({
    type: 'enum',
    enum: MetricScope,
  })
  scope: MetricScope;

  @Column({ type: 'text', nullable: true })
  prompt: string | null;

  @Column({ name: 'code_repo_url', type: 'varchar', length: 500, nullable: true })
  codeRepoUrl: string | null;

  @Column({ name: 'code_branch', type: 'varchar', length: 100, default: 'master' })
  codeBranch: string;

  @Column({ name: 'created_by', type: 'varchar', length: 100, nullable: true })
  createdBy: string | null;

  @Column({ name: 'updated_by', type: 'varchar', length: 100, nullable: true })
  updatedBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
