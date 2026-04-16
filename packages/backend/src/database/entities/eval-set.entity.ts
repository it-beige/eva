import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { EvalSetType, EvalSetSourceType } from '@eva/shared';
import { EvalSetItem } from './eval-set-item.entity';
import { EvalTask } from './eval-task.entity';
import { LeaderboardEntry } from './leaderboard-entry.entity';

@Entity('eval_sets')
export class EvalSet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: EvalSetType,
  })
  type: EvalSetType;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'data_count', type: 'int', default: 0 })
  dataCount: number;

  @Column({
    name: 'source_type',
    type: 'enum',
    enum: EvalSetSourceType,
  })
  sourceType: EvalSetSourceType;

  @Column({ name: 'git_repo_url', type: 'varchar', length: 500, nullable: true })
  gitRepoUrl: string | null;

  @Column({ name: 'last_eval_time', type: 'timestamp', nullable: true })
  lastEvalTime: Date | null;

  @Column({ name: 'created_by', type: 'varchar', length: 100, nullable: true })
  createdBy: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  tags: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => EvalSetItem, (item) => item.evalSet)
  items: EvalSetItem[];

  @OneToMany(() => EvalTask, (task) => task.evalSet)
  tasks: EvalTask[];

  @OneToMany(() => LeaderboardEntry, (entry) => entry.evalSet)
  leaderboardEntries: LeaderboardEntry[];
}
