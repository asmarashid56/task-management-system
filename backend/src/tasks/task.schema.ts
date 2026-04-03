import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TaskDocument = Task & Document;

@Schema()
export class Task {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ default: 'Pending' })
  status: string;

  @Prop()
  dueDate: Date;

  // ✅ New progress field (0–100)
  @Prop({ type: Number, default: 0 })
  progress: number;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
