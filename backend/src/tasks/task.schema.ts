import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TaskDocument = Task & Document;

@Schema()
export class Task {
  @Prop({ required: true })
  title!: string;

  @Prop()
  description!: string;

  @Prop({ default: 'Pending' })
  status!: string;

  @Prop()
  dueDate!: Date;

  // ✅ New progress field (0–100)
  @Prop({ type: Number, default: 0 })
  progress!: number;

  // ✅ Owner field (single user ID)
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner!: Types.ObjectId;

  // ✅ SharedWith field (array of user IDs, always initialized)
  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  sharedWith!: Types.ObjectId[];

  // ✅ Attachments field (array of objects with filename + url)
  @Prop({
    type: [
      {
        filename: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    default: [],
  })
  attachments!: { filename: string; url: string }[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);

// ✅ Add indexes for query optimization
TaskSchema.index({ owner: 1 });                  // speeds up queries by owner
TaskSchema.index({ status: 1 });                 // speeds up queries by status
TaskSchema.index({ dueDate: 1 });                // speeds up queries by dueDate
TaskSchema.index({ owner: 1, status: 1, dueDate: 1 }); // compound index for analytics
