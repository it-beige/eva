import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@WebSocketGateway({
  namespace: '/eval-tasks',
  cors: {
    origin: '*',
  },
})
@UseGuards(AuthGuard('jwt'))
export class EvalTaskGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EvalTaskGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, taskId: string) {
    client.join(`task:${taskId}`);
    this.logger.log(`Client ${client.id} subscribed to task ${taskId}`);
    return { event: 'subscribed', data: { taskId } };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(client: Socket, taskId: string) {
    client.leave(`task:${taskId}`);
    this.logger.log(`Client ${client.id} unsubscribed from task ${taskId}`);
    return { event: 'unsubscribed', data: { taskId } };
  }

  // 发送进度更新
  sendProgress(taskId: string, progress: number) {
    this.server.to(`task:${taskId}`).emit('task:progress', {
      taskId,
      progress,
      timestamp: new Date().toISOString(),
    });
  }

  // 发送状态更新
  sendStatus(taskId: string, status: string) {
    this.server.to(`task:${taskId}`).emit('task:status', {
      taskId,
      status,
      timestamp: new Date().toISOString(),
    });
  }

  // 发送日志更新
  sendLog(taskId: string, log: string) {
    this.server.to(`task:${taskId}`).emit('task:log', {
      taskId,
      log,
      timestamp: new Date().toISOString(),
    });
  }
}
