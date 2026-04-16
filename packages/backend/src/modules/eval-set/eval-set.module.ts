import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvalSetController } from './eval-set.controller';
import { EvalSetItemController } from './eval-set-item.controller';
import { EvalSetService } from './eval-set.service';
import { EvalSetItemService } from './eval-set-item.service';
import { EvalSet, EvalSetItem } from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([EvalSet, EvalSetItem])],
  controllers: [EvalSetController, EvalSetItemController],
  providers: [EvalSetService, EvalSetItemService],
  exports: [EvalSetService, EvalSetItemService],
})
export class EvalSetModule {}
