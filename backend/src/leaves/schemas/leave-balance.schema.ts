import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LeaveBalanceDocument = HydratedDocument<LeaveBalance>;

@Schema({ timestamps: true })
export class LeaveBalance {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'LeaveType', required: true })
  leaveTypeId: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  entitledDays: number;     // Based on entitlement rules

  @Prop({ type: Number, default: 0 })
  accruedDays: number;      // Accumulated monthly/annually

  @Prop({ type: Number, default: 0 })
  takenDays: number;        // Used leaves

  @Prop({ type: Number, default: 0 })
  carryOverDays: number;    // From previous year

  @Prop({ type: Number, default: 0 })
  remainingDays: number;    // Calculated: (entitled + accrued + carryOver - taken)

  @Prop({ type: Date })
  lastAccrualDate: Date;    // For scheduling accrual jobs
}

export const LeaveBalanceSchema = SchemaFactory.createForClass(LeaveBalance);
