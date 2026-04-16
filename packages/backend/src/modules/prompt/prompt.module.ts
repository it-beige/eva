import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromptController } from './prompt.controller';
import { PromptService } from './prompt.service';
import { Prompt } from '../../database/entities/prompt.entity';
import { PromptVersion } from '../../database/entities/prompt-version.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Prompt, PromptVersion])],
  controllers: [PromptController],
  providers: [PromptService],
  exports: [PromptService],
})
export class PromptModule {}
