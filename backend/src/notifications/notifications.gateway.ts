import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class NotificationsGateway {
  @WebSocketServer()
  server!: Server;

  // ✅ Emit when a task is shared
  notifyTaskShared(taskId: string, userIds: string[]) {
    this.server.emit('taskShared', { taskId, userIds });
  }

  // ✅ Emit when a task is updated
  notifyTaskUpdated(taskId: string, status: string) {
    this.server.emit('taskUpdated', { taskId, status });
  }

  // Example listener (optional)
  @SubscribeMessage('ping')
  handlePing(@MessageBody() data: string): string {
    return `pong: ${data}`;
  }
}
