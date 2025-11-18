import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose';

export type OffboardingTrackerDocument = HydratedDocument<OffboardingTracker>;

@Schema({ timestamps: true, collection: 'offboardingtrackers' })
export class OffboardingTracker {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  initiatedBy: Types.ObjectId;

  @Prop({ type: String })
  reason: string;

  @Prop({
    type: String,
    enum: ['pending', 'in_progress', 'cleared', 'completed', 'cancelled'],
    default: 'pending'
  })
  status: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'OffboardingTask' }] })
  clearanceTasks: Types.ObjectId[];

  @Prop({ type: Boolean, default: false })
  clearanceSignoffsstatus: boolean;

  @Prop({ type: Date })
  exitDate: Date;

  @Prop({ type: MongooseSchema.Types.Mixed })
  meta: any;
}

export const OffboardingTrackerSchema = SchemaFactory.createForClass(OffboardingTracker);

