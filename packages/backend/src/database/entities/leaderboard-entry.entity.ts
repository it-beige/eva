import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AIApplication } from './ai-application.entity';
import { EvalSet } from './eval-set.entity';
import { EvalMetric } from './eval-metric.entity';

@Entity('leaderboard_entries')
export class LeaderboardEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'app_id', type: 'uuid', nullable: true })
  appId: string | null;

  @ManyToOne(() => AIApplication, (application) => application.leaderboardEntries, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'app_id' })
  application: AIApplication | null;

  @Column({ name: 'eval_set_id', type: 'uuid', nullable: true })
  evalSetId: string | null;

  @ManyToOne(() => EvalSet, (evalSet) => evalSet.leaderboardEntries, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'eval_set_id' })
  evalSet: EvalSet | null;

  @Column({ name: 'metric_id', type: 'uuid', nullable: true })
  metricId: string | null;

  @ManyToOne(() => EvalMetric, (metric) => metric.leaderboardEntries, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'metric_id' })
  metric: EvalMetric | null;

  @Column({ type: 'float' })
  score: number;

  @Column({ type: 'int', nullable: true })
  rank: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
