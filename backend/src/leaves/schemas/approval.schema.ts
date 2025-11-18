import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ApprovalDocument = Approval & Document;

@Schema({ timestamps: true })
export class Approval {
  @Prop({ type: Types.ObjectId, ref: 'LeaveRequest', required: true })
  leaveRequestId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  approverId: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['Manager', 'HR_Admin', 'HR_Manager', 'System'],
    required: true,
  })
  role: string; // Who approved?

  @Prop({
    type: String,
    enum: ['approved', 'rejected', 'pending'],
    default: 'pending',
  })
  status: string;

  @Prop()
  comment: string; // Optional note by approver
}

export const ApprovalSchema = SchemaFactory.createForClass(Approval);
