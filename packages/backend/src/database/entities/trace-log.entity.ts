import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';

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
  @Column({ name: 'user_id', type: 'varchar', length: 100, nullable: true })
  userId: string | null;

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
