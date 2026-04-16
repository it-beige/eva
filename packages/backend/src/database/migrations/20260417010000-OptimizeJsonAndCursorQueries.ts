import { MigrationInterface, QueryRunner } from 'typeorm';

export class OptimizeJsonAndCursorQueries20260417010000
  implements MigrationInterface
{
  name = 'OptimizeJsonAndCursorQueries20260417010000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "idx_eval_tasks_config_gin" ON "eval_tasks" USING GIN ("config")',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "idx_auto_evals_filter_rules_gin" ON "auto_evals" USING GIN ("filter_rules")',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "idx_eval_sets_tags_gin" ON "eval_sets" USING GIN ("tags")',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "idx_eval_set_items_input_gin" ON "eval_set_items" USING GIN ("input")',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "idx_eval_set_items_output_gin" ON "eval_set_items" USING GIN ("output")',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "idx_eval_set_items_metadata_gin" ON "eval_set_items" USING GIN ("metadata")',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "idx_trace_logs_called_at_id" ON "trace_logs" ("called_at" DESC, "id" DESC)',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "idx_leaderboard_entries_score_updated_at" ON "leaderboard_entries" ("score" DESC, "updated_at" DESC)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "idx_leaderboard_entries_score_updated_at"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_trace_logs_called_at_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_eval_set_items_metadata_gin"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_eval_set_items_output_gin"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_eval_set_items_input_gin"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_eval_sets_tags_gin"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_auto_evals_filter_rules_gin"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_eval_tasks_config_gin"');
  }
}
