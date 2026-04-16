import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { PlaygroundService } from './playground.service';
import { RunPlaygroundDto } from './dto/run-playground.dto';

@WebSocketGateway({
  namespace: 'playground',
  cors: {
    origin: '*',
  },
})
export class PlaygroundGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(PlaygroundGateway.name);

  constructor(private readonly playgroundService: PlaygroundService) {}

  @SubscribeMessage('playground:run')
  async handlePlaygroundRun(
    @MessageBody() dto: RunPlaygroundDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.logger.log(`Playground run started - Client: ${client.id}`);
    
    try {
      const stream$ = this.playgroundService.runStream(dto);
      
      stream$.subscribe({
        next: (event) => {
          client.emit('playground:stream', event);
        },
        error: (error) => {
          this.logger.error(`Playground stream error: ${error.message}`);
          client.emit('playground:stream', {
            type: 'error',
            error: error.message || 'Stream processing failed',
          });
        },
        complete: () => {
          this.logger.log(`Playground run completed - Client: ${client.id}`);
        },
      });
    } catch (error) {
      this.logger.error(`Playground run error: ${error.message}`);
      client.emit('playground:stream', {
        type: 'error',
        error: error.message || 'Failed to start playground',
      });
    }
  }

  @SubscribeMessage('playground:stop')
  handlePlaygroundStop(@ConnectedSocket() client: Socket): void {
    this.logger.log(`Playground stopped by client: ${client.id}`);
    // 在实际实现中，这里可以取消正在进行的请求
    client.emit('playground:stopped', { message: 'Playground stopped' });
  }

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
