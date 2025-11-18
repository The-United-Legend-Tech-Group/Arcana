import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LeaveRequestDocument = HydratedDocument<LeaveRequest>;

@Schema({ timestamps: true })
export class LeaveRequest {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'LeaveType', required: true })
  leaveTypeId: Types.ObjectId;

  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date, required: true })
  endDate: Date;

  @Prop({ type: Number, required: true })
  duration: number;   // Net days excluding holidays/weekends (BR23)

  @Prop({ type: String, default: '' })
  justification: string;

  @Prop({ type: [String] })    // File path / cloud URL
  supportDocument: string[];   // For REQ-016 (e.g., medical certificate)

  @Prop({ type: String, default: '' })
  replacementEmployee: string;

  @Prop({ type: Date, default: null })
  forDay: Date;

  @Prop({
    type: String,
    enum: [
      'Pending',
      'Rejected',
      'Approved',
    ],
    default: 'Pending',
  })
  status: string;

  @Prop({ type: String })  // Explanation for decisions
  comment: string;

  @Prop({ type: Number })  // Calculated days excluding holidays
  durationDays: number;

  @Prop({ type: Boolean })  // Some companies allow applying after returning from sick leave
  isAfterLeaveSubmission: boolean;

  @Prop({ type: Date, default: Date.now })  // Required for audit and history
  timestamps: Date;

}

export const LeaveRequestSchema = SchemaFactory.createForClass(LeaveRequest);
