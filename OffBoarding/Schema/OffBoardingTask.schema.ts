import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose';


export type OffboardingTaskDocument = HydratedDocument<OffboardingTask>;

@Schema({ timestamps: true, collection: 'offboardingtasks' })
export class OffboardingTask {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'OffboardingTracker', required: true })
  offboardingTrackerId: Types.ObjectId;

  @Prop({ type: String })
  title: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String })
  assignedToRole: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  assignedToUserId: Types.ObjectId;

  @Prop({ type: Date })
  dueDate: Date;

  @Prop({
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'skipped'],
    default: 'pending'
  })
  status: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Asset' }] })
  assets: Types.ObjectId[];

  @Prop({ type: String })
  notes: string;

  @Prop({ type: Date })
  completedAt: Date;
}

export const OffboardingTaskSchema = SchemaFactory.createForClass(OffboardingTask);