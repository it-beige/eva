import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObservabilityController } from './observability.controller';
import { ObservabilityService } from './observability.service';
import { TraceLog } from '../../database/entities/trace-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TraceLog])],
  controllers: [ObservabilityController],
  providers: [ObservabilityService],
  exports: [ObservabilityService],
})
export class ObservabilityModule {}
