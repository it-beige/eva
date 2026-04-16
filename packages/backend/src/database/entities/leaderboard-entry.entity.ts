import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('leaderboard_entries')
export class LeaderboardEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'app_id', type: 'uuid', nullable: true })
  appId: string | null;

  @Column({ name: 'eval_set_id', type: 'uuid', nullable: true })
  evalSetId: string | null;

  @Column({ name: 'metric_id', type: 'uuid', nullable: true })
  metricId: string | null;

  @Column({ type: 'float' })
  score: number;

  @Column({ type: 'int', nullable: true })
  rank: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
