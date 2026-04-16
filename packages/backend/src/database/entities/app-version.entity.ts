import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AIApplication } from './ai-application.entity';

@Entity('app_versions')
export class AppVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'app_id', type: 'uuid' })
  appId: string;

  @Column({ type: 'varchar', length: 50 })
  version: string;

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, unknown> | null;

  @ManyToOne(() => AIApplication, (app) => app.versions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application: AIApplication;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
