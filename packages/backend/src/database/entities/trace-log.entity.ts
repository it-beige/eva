import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AIApplication } from './ai-application.entity';
import { User } from './user.entity';

@Entity('trace_logs')
export class TraceLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'trace_id', type: 'varchar', length: 100 })
  traceId: string;

  @Index()
  @Column({ name: 'session_id', type: 'varchar', length: 100, nullable: true })
  sessionId: string | null;

  @Index()
  @Column({ name: 'app_id', type: 'uuid', nullable: true })
  appId: string | null;

  @ManyToOne(() => AIApplication, (application) => application.traceLogs, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'app_id' })
  application: AIApplication | null;

  @Index()
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @ManyToOne(() => User, (user) => user.traceLogs, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ name: 'node_id', type: 'varchar', length: 100, nullable: true })
  nodeId: string | null;

  @Column({ name: 'message_id', type: 'varchar', length: 100, nullable: true })
  messageId: string | null;

  @Column({ type: 'text', nullable: true })
  input: string | null;

  @Column({ type: 'text', nullable: true })
  output: string | null;

  @Column({ name: 'input_tokens', type: 'int', nullable: true })
  inputTokens: number | null;

  @Column({ name: 'output_tokens', type: 'int', nullable: true })
  outputTokens: number | null;

  @Column({ type: 'float', nullable: true, comment: '首次token响应时间ms' })
  ttft: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  status: string | null;

  @Column({ name: 'source_project', type: 'varchar', length: 100, nullable: true })
  sourceProject: string | null;

  @Index()
  @CreateDateColumn({ name: 'called_at' })
  calledAt: Date;
}
