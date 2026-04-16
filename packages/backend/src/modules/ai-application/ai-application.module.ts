import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIApplicationController } from './ai-application.controller';
import { AIApplicationService } from './ai-application.service';
import { AIApplication } from '../../database/entities/ai-application.entity';
import { AppVersion } from '../../database/entities/app-version.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AIApplication, AppVersion])],
  controllers: [AIApplicationController],
  providers: [AIApplicationService],
  exports: [AIApplicationService],
})
export class AIApplicationModule {}
