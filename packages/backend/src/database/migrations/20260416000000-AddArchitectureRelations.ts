import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddArchitectureRelations20260416000000
  implements MigrationInterface
{
  name = 'AddArchitectureRelations20260416000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.ensureEvalTaskForeignKeys(queryRunner);
    await this.ensureLeaderboardForeignKeys(queryRunner);
    await this.ensureTraceLogRelations(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.dropForeignKey(queryRunner, 'trace_logs', 'fk_trace_logs_app_id');
    await this.dropForeignKey(queryRunner, 'trace_logs', 'fk_trace_logs_user_id');
    await this.dropForeignKey(
      queryRunner,
      'leaderboard_entries',
      'fk_leaderboard_entries_app_id',
    );
    await this.dropForeignKey(
      queryRunner,
      'leaderboard_entries',
      'fk_leaderboard_entries_eval_set_id',
    );
    await this.dropForeignKey(
      queryRunner,
      'leaderboard_entries',
      'fk_leaderboard_entries_metric_id',
    );
    await this.dropForeignKey(queryRunner, 'eval_tasks', 'fk_eval_tasks_eval_set_id');
    await this.dropForeignKey(queryRunner, 'eval_tasks', 'fk_eval_tasks_app_id');

    if (await queryRunner.hasColumn('trace_logs', 'app_id')) {
      await queryRunner.dropColumn('trace_logs', 'app_id');
    }

    if (await queryRunner.hasTable('trace_logs')) {
      await queryRunner.query(`
        ALTER TABLE trace_logs
        ALTER COLUMN user_id TYPE varchar(100)
        USING user_id::text
      `);
    }
  }

  private async ensureEvalTaskForeignKeys(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('eval_tasks'))) {
      return;
    }

    await this.createIndexIfNeeded(
      queryRunner,
      'eval_tasks',
      'idx_eval_tasks_eval_set_id',
      ['eval_set_id'],
    );
    await this.createIndexIfNeeded(
      queryRunner,
      'eval_tasks',
      'idx_eval_tasks_app_id',
      ['app_id'],
    );
    await this.createForeignKeyIfNeeded(
      queryRunner,
      'eval_tasks',
      new TableForeignKey({
        name: 'fk_eval_tasks_eval_set_id',
        columnNames: ['eval_set_id'],
        referencedTableName: 'eval_sets',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
    await this.createForeignKeyIfNeeded(
      queryRunner,
      'eval_tasks',
      new TableForeignKey({
        name: 'fk_eval_tasks_app_id',
        columnNames: ['app_id'],
        referencedTableName: 'ai_applications',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  private async ensureLeaderboardForeignKeys(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('leaderboard_entries'))) {
      return;
    }

    await this.createIndexIfNeeded(
      queryRunner,
      'leaderboard_entries',
      'idx_leaderboard_entries_app_id',
      ['app_id'],
    );
    await this.createIndexIfNeeded(
      queryRunner,
      'leaderboard_entries',
      'idx_leaderboard_entries_eval_set_id',
      ['eval_set_id'],
    );
    await this.createIndexIfNeeded(
      queryRunner,
      'leaderboard_entries',
      'idx_leaderboard_entries_metric_id',
      ['metric_id'],
    );
    await this.createForeignKeyIfNeeded(
      queryRunner,
      'leaderboard_entries',
      new TableForeignKey({
        name: 'fk_leaderboard_entries_app_id',
        columnNames: ['app_id'],
        referencedTableName: 'ai_applications',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
    await this.createForeignKeyIfNeeded(
      queryRunner,
      'leaderboard_entries',
      new TableForeignKey({
        name: 'fk_leaderboard_entries_eval_set_id',
        columnNames: ['eval_set_id'],
        referencedTableName: 'eval_sets',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
    await this.createForeignKeyIfNeeded(
      queryRunner,
      'leaderboard_entries',
      new TableForeignKey({
        name: 'fk_leaderboard_entries_metric_id',
        columnNames: ['metric_id'],
        referencedTableName: 'eval_metrics',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  private async ensureTraceLogRelations(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('trace_logs'))) {
      return;
    }

    if (!(await queryRunner.hasColumn('trace_logs', 'app_id'))) {
      await queryRunner.addColumn(
        'trace_logs',
        new TableColumn({
          name: 'app_id',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    await queryRunner.query(`
      ALTER TABLE trace_logs
      ALTER COLUMN user_id TYPE uuid
      USING CASE
        WHEN user_id IS NULL OR user_id = '' THEN NULL
        WHEN user_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN user_id::uuid
        ELSE NULL
      END
    `);

    await this.createIndexIfNeeded(
      queryRunner,
      'trace_logs',
      'idx_trace_logs_app_id',
      ['app_id'],
    );
    await this.createIndexIfNeeded(
      queryRunner,
      'trace_logs',
      'idx_trace_logs_user_id',
      ['user_id'],
    );
    await this.createForeignKeyIfNeeded(
      queryRunner,
      'trace_logs',
      new TableForeignKey({
        name: 'fk_trace_logs_app_id',
        columnNames: ['app_id'],
        referencedTableName: 'ai_applications',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
    await this.createForeignKeyIfNeeded(
      queryRunner,
      'trace_logs',
      new TableForeignKey({
        name: 'fk_trace_logs_user_id',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  private async createIndexIfNeeded(
    queryRunner: QueryRunner,
    tableName: string,
    indexName: string,
    columnNames: string[],
  ): Promise<void> {
    const table = await queryRunner.getTable(tableName);
    if (!table || table.indices.some((index) => index.name === indexName)) {
      return;
    }

    await queryRunner.query(
      `CREATE INDEX "${indexName}" ON "${tableName}" (${columnNames
        .map((columnName) => `"${columnName}"`)
        .join(', ')})`,
    );
  }

  private async createForeignKeyIfNeeded(
    queryRunner: QueryRunner,
    tableName: string,
    foreignKey: TableForeignKey,
  ): Promise<void> {
    const table = await queryRunner.getTable(tableName);
    if (!table || table.foreignKeys.some((item) => item.name === foreignKey.name)) {
      return;
    }

    await queryRunner.createForeignKey(tableName, foreignKey);
  }

  private async dropForeignKey(
    queryRunner: QueryRunner,
    tableName: string,
    foreignKeyName: string,
  ): Promise<void> {
    const table = await queryRunner.getTable(tableName);
    const foreignKey = table?.foreignKeys.find((item) => item.name === foreignKeyName);

    if (foreignKey) {
      await queryRunner.dropForeignKey(tableName, foreignKey);
    }
  }
}
