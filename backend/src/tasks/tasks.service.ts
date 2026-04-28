import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, PipelineStage } from 'mongoose'; // ✅ added PipelineStage
import { Task, TaskDocument } from './task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { UsersService } from '../users/users.service';
import type { Express } from 'express'; // ✅ use Express namespace for Multer types

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    private readonly usersService: UsersService,
    private readonly notificationsGateway: NotificationsGateway
  ) {}

  async create(dto: CreateTaskDto, ownerId: string): Promise<Task> {
    const task = new this.taskModel({ ...dto, owner: new Types.ObjectId(ownerId) });
    const savedTask = await task.save();
    this.notificationsGateway.notifyTaskUpdated(savedTask._id.toString(), savedTask.status);
    return savedTask;
  }

  async findAll(query?: any): Promise<Task[]> {
    const filter: any = {};
    if (query?.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
      ];
    }
    if (query?.status) filter.status = query.status;
    if (query?.dueDate) filter.dueDate = query.dueDate;
    return this.taskModel.find(filter).exec();
  }

  async findMyTasks(userId: string): Promise<Task[]> {
    return this.taskModel.find({ owner: new Types.ObjectId(userId) }).exec();
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskModel.findById(id).exec();
    if (!task) throw new NotFoundException(`Task with ID ${id} not found`);
    return task;
  }

  async update(id: string, dto: CreateTaskDto): Promise<Task> {
    const task = await this.taskModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!task) throw new NotFoundException(`Task with ID ${id} not found`);
    this.notificationsGateway.notifyTaskUpdated(task._id.toString(), task.status);
    return task;
  }

  async updateProgress(id: string, progress: number): Promise<Task> {
    const task = await this.taskModel.findByIdAndUpdate(id, { progress }, { new: true }).exec();
    if (!task) throw new NotFoundException(`Task with ID ${id} not found`);
    this.notificationsGateway.notifyTaskUpdated(task._id.toString(), task.status);
    return task;
  }

  async remove(id: string): Promise<Task> {
    const task = await this.taskModel.findByIdAndDelete(id).exec();
    if (!task) throw new NotFoundException(`Task with ID ${id} not found`);
    this.notificationsGateway.notifyTaskUpdated(task._id.toString(), 'Deleted');
    return task;
  }

  async shareTask(taskId: string, userIds: string[] | string, ownerId: string): Promise<Task> {
    const task = await this.taskModel.findById(taskId).exec();
    if (!task) throw new NotFoundException(`Task with ID ${taskId} not found`);

    if (!task.owner) {
      throw new NotFoundException('Task has no owner set. Cannot share.');
    }

    if (task.owner.toString() !== ownerId) {
      throw new ForbiddenException('You are not allowed to share this task');
    }

    const existingShared = Array.isArray(task.sharedWith) ? task.sharedWith : [];
    const idsArray = Array.isArray(userIds) ? userIds : [userIds];

    const resolvedIds = await Promise.all(
      idsArray.map(async (idOrEmail) => {
        if (Types.ObjectId.isValid(idOrEmail)) {
          return new Types.ObjectId(idOrEmail);
        }
        try {
          const userId = await this.usersService.findUserIdByEmail(idOrEmail);
          return userId ? new Types.ObjectId(userId) : null;
        } catch {
          return null;
        }
      })
    );

    const objectIds = resolvedIds.filter((id) => id !== null);

    const merged = [...existingShared, ...objectIds]
      .filter((id) => id && typeof id.toString === 'function')
      .map((id) => id.toString());

    task.sharedWith = [...new Set(merged)].map((id) => new Types.ObjectId(id));

    const savedTask = await task.save();

    this.notificationsGateway.notifyTaskShared(taskId, idsArray);

    return savedTask;
  }

  async getSharedTasks(userId: string): Promise<Task[]> {
    return this.taskModel.find({ sharedWith: new Types.ObjectId(userId) }).exec();
  }

  // ✅ Analytics overview
  async getAnalyticsOverview(userId: string) {
    const pipeline: PipelineStage[] = [
      { $match: { owner: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ];

    const results = await this.taskModel.aggregate(pipeline).exec();

    const summary: any = {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
    };

    results.forEach((r) => {
      summary.total += r.count;
      if (r._id === 'Pending') summary.pending = r.count;
      if (r._id === 'In Progress') summary.inProgress = r.count;
      if (r._id === 'Completed') summary.completed = r.count;
    });

    return summary;
  }

  // ✅ Analytics trends (last 12 weeks, completed vs overdue)
  async getAnalyticsTrends(userId: string) {
    const pipeline: PipelineStage[] = [
      { $match: { owner: new Types.ObjectId(userId) } },
      {
        $project: {
          status: 1,
          dueDate: 1,
          week: { $isoWeek: '$dueDate' },
          year: { $isoWeekYear: '$dueDate' },
        },
      },
      {
        $group: {
          _id: { week: '$week', year: '$year' },
          completed: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0],
            },
          },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$status', 'Completed'] },
                    { $lt: ['$dueDate', new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { '_id.year': -1, '_id.week': -1 } }, // newest first
      { $limit: 12 }, // ✅ only last 12 weeks
    ];

    const results = await this.taskModel.aggregate(pipeline).exec();

    // reverse so frontend sees oldest → newest
    return results.reverse().map((r) => ({
      week: `W${r._id.week}-${r._id.year}`,
      completed: r.completed,
      overdue: r.overdue,
    }));
  }

  // ✅ Add attachment to a task
  async addAttachment(taskId: string, file: Express.Multer.File, userId: string): Promise<Task> {
    const task = await this.taskModel.findById(taskId).exec();
    if (!task) throw new NotFoundException(`Task with ID ${taskId} not found`);

    // Only owner can add attachments
    if (task.owner.toString() !== userId) {
      throw new ForbiddenException('You are not allowed to add attachments to this task');
    }

    const url = `/uploads/${file.filename}`; // or Cloudinary/S3 URL if integrated

    task.attachments.push({
      filename: file.originalname,
      url,
    });

    const savedTask = await task.save();

    this.notificationsGateway.notifyTaskUpdated(task._id.toString(), 'Attachment Added');

    return savedTask;
  }
}
