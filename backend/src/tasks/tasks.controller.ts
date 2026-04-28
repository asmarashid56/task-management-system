import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ShareTaskDto } from './dto/share-task.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../multer.config'; // ✅ import storage config
import type { Express } from 'express';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateTaskDto, @Req() req: any) {
    return this.tasksService.create(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req: any, @Query() query: any) {
    return this.tasksService.findMyTasks(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('shared')
  getSharedTasks(@Req() req: any) {
    return this.tasksService.getSharedTasks(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  getMyTasks(@Req() req: any) {
    return this.tasksService.findMyTasks(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('analytics/overview')
  getAnalyticsOverview(@Req() req: any) {
    return this.tasksService.getAnalyticsOverview(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('analytics/trends')
  getAnalyticsTrends(@Req() req: any) {
    return this.tasksService.getAnalyticsTrends(req.user.id);
  }

  // ✅ Upload attachments to a task with storage config
  @UseGuards(JwtAuthGuard)
  @Post(':id/attachments')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  uploadAttachment(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.tasksService.addAttachment(id, file, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.tasksService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: CreateTaskDto, @Req() req: any) {
    return this.tasksService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/progress')
  updateProgress(
    @Param('id') id: string,
    @Body('progress') progress: number,
    @Req() req: any,
  ) {
    return this.tasksService.updateProgress(id, progress);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.tasksService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/share')
  shareTask(@Param('id') id: string, @Body() dto: ShareTaskDto, @Req() req: any) {
    const userIds = Array.isArray(dto.userIds) ? dto.userIds : [dto.userIds];
    return this.tasksService.shareTask(id, userIds, req.user.id);
  }
}
