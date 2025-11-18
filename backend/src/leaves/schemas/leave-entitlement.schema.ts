import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LeaveEntitlementDocument = LeaveEntitlement & Document;

@Schema({ timestamps: true })
export class LeaveEntitlement {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'LeaveType', required: true })
  leaveTypeId: Types.ObjectId;

  @Prop({ required: true })
  entitlementDays: number; // Total yearly allowance

  @Prop({ default: 0 })
  usedDays: number; // Auto-updated after approval


  @Prop({
    type: String,
    enum: ['monthly', 'quarterly', 'yearly', 'none'],
    default: 'yearly',
  })
  accrualMethod: string;

  @Prop({ default: 0 })
  accrualRate: number; // Example: 1.75 per month

  @Prop({ default: false })
  carryOverAllowed: boolean;

  @Prop()
  carryOverExpiryDate: Date;

  @Prop({ type: Object, default: {} })
  customRules: Record<string, any>;

  @Prop({ default: true })
  isActive: boolean;
}

export const LeaveEntitlementSchema =
  SchemaFactory.createForClass(LeaveEntitlement);
