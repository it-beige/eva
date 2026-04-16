import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AutoEvalStatus } from '@eva/shared';

@Entity('auto_evals')
export class AutoEval {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: AutoEvalStatus,
    default: AutoEvalStatus.ENABLED,
  })
  status: AutoEvalStatus;

  @Column({ name: 'filter_rules', type: 'jsonb', nullable: true })
  filterRules: Record<string, unknown> | null;

  @Column({ name: 'sample_rate', type: 'float', default: 0 })
  sampleRate: number;

  @Column({ name: 'metric_ids', type: 'jsonb' })
  metricIds: string[];

  @Column({ name: 'created_by', type: 'varchar', length: 100, nullable: true })
  createdBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
