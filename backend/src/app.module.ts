import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { NotificationsGateway } from './notifications/notifications.gateway';

@Module({
  imports: [
    // ✅ Use Railway environment variable instead of localhost
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskdb'),
    TasksModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, NotificationsGateway],
})
export class AppModule {}
