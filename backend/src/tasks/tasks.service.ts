import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from './task.schema';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<TaskDocument>) {}

  async create(dto: CreateTaskDto): Promise<Task> {
    const task = new this.taskModel(dto);
    return task.save();
  }

  // ✅ Supports search and filters
  async findAll(query?: any): Promise<Task[]> {
    const filter: any = {};

    // Keyword search (title or description)
    if (query?.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
      ];
    }

    // Status filter (pending/completed)
    if (query?.status) {
      filter.status = query.status;
    }

    // Due date filter
    if (query?.dueDate) {
      filter.dueDate = query.dueDate;
    }

    return this.taskModel.find(filter).exec();
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskModel.findById(id).exec();
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async update(id: string, dto: CreateTaskDto): Promise<Task> {
    const task = await this.taskModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async updateProgress(id: string, progress: number): Promise<Task> {
    const task = await this.taskModel.findByIdAndUpdate(
      id,
      { progress },
      { new: true }
    ).exec();

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async remove(id: string): Promise<Task> {
    const task = await this.taskModel.findByIdAndDelete(id).exec();
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }
}
