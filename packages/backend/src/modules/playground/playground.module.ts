import { Module } from '@nestjs/common';
import { PlaygroundController } from './playground.controller';
import { PlaygroundService } from './playground.service';
import { PlaygroundGateway } from './playground.gateway';

@Module({
  controllers: [PlaygroundController],
  providers: [PlaygroundService, PlaygroundGateway],
  exports: [PlaygroundService],
})
export class PlaygroundModule {}
