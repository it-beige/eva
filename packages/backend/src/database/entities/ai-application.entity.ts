import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Project } from './project.entity';
import { AppVersion } from './app-version.entity';
import { EvalTask } from './eval-task.entity';
import { LeaderboardEntry } from './leaderboard-entry.entity';
import { TraceLog } from './trace-log.entity';

@Entity('ai_applications')
export class AIApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  icon: string | null;

  @Column({ name: 'latest_version', type: 'varchar', length: 50, nullable: true })
  latestVersion: string | null;

  @Column({ name: 'git_repo_url', type: 'varchar', length: 500, nullable: true })
  gitRepoUrl: string | null;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @ManyToOne(() => Project, (project) => project.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => AppVersion, (version) => version.application)
  versions: AppVersion[];

  @OneToMany(() => EvalTask, (task) => task.application)
  tasks: EvalTask[];

  @OneToMany(() => LeaderboardEntry, (entry) => entry.application)
  leaderboardEntries: LeaderboardEntry[];

  @OneToMany(() => TraceLog, (traceLog) => traceLog.application)
  traceLogs: TraceLog[];
}
