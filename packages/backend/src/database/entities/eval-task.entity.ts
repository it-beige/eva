import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EvalTaskStatus, EvalType } from '@eva/shared';
import { EvalSet } from './eval-set.entity';
import { AIApplication } from './ai-application.entity';

@Entity('eval_tasks')
export class EvalTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'short_id', type: 'varchar', length: 6, unique: true })
  shortId: string;

  @Column({
    type: 'enum',
    enum: EvalTaskStatus,
    default: EvalTaskStatus.PENDING,
  })
  status: EvalTaskStatus;

  @Column({ type: 'float', default: 0 })
  progress: number;

  @Column({
    type: 'enum',
    enum: EvalType,
  })
  evalType: EvalType;

  @Column({ name: 'eval_mode', type: 'varchar', length: 50, nullable: true })
  evalMode: string | null;

  @Column({ name: 'max_concurrency', type: 'int', default: 10 })
  maxConcurrency: number;

  @Column({ name: 'eval_set_id', type: 'uuid', nullable: true })
  evalSetId: string | null;

  @ManyToOne(() => EvalSet, (evalSet) => evalSet.tasks, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'eval_set_id' })
  evalSet: EvalSet | null;

  @Column({ name: 'task_group_id', type: 'varchar', length: 100, nullable: true })
  taskGroupId: string | null;

  @Column({ name: 'eval_model_id', type: 'varchar', length: 100, nullable: true })
  evalModelId: string | null;

  @Column({ name: 'app_id', type: 'uuid', nullable: true })
  appId: string | null;

  @ManyToOne(() => AIApplication, (application) => application.tasks, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'app_id' })
  application: AIApplication | null;

  @Column({ name: 'app_version', type: 'varchar', length: 50, nullable: true })
  appVersion: string | null;

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, unknown> | null;

  @Column({ name: 'created_by', type: 'varchar', length: 100, nullable: true })
  createdBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
