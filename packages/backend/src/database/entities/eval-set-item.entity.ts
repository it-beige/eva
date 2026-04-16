import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EvalSet } from './eval-set.entity';

@Entity('eval_set_items')
export class EvalSetItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'eval_set_id', type: 'uuid' })
  evalSetId: string;

  @Column({ type: 'jsonb' })
  input: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  output: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @ManyToOne(() => EvalSet, (evalSet) => evalSet.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eval_set_id' })
  evalSet: EvalSet;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
