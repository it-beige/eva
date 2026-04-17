import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ProjectSource } from '@eva/shared';
import { AIApplication } from './ai-application.entity';
import { User } from './user.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  pid: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'app_code', type: 'varchar', length: 100, nullable: true })
  appCode: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    default: ProjectSource.DIRECT,
  })
  source: ProjectSource;

  @Column({ name: 'create_mode', type: 'varchar', length: 20, default: 'direct' })
  createMode: string;

  @Column({ name: 'platform', type: 'varchar', length: 100, nullable: true })
  platform: string | null;

  @Column({ name: 'linked_app', type: 'varchar', length: 100, nullable: true })
  linkedApp: string | null;

  @Column({ name: 'joint_apps', type: 'jsonb', nullable: true })
  jointApps: string[] | null;

  @Column({ name: 'user_count', type: 'int', default: 0 })
  userCount: number;

  @Column({ name: 'encryption', type: 'jsonb', nullable: true })
  encryption: { keyName: string; issueCode: string; generated: boolean } | null;

  @ManyToMany(() => User, { eager: true })
  @JoinTable({
    name: 'project_admins',
    joinColumn: { name: 'project_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  admins: User[];

  @ManyToMany(() => User, { eager: true })
  @JoinTable({
    name: 'project_users',
    joinColumn: { name: 'project_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  users: User[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => AIApplication, (app) => app.project)
  applications: AIApplication[];
}
