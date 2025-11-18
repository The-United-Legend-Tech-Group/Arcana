import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LeavePolicyDocument = LeavePolicy & Document;

@Schema({
  timestamps: true,
})
export class LeavePolicy {
  @Prop({ 
    type: Types.ObjectId,
     ref: 'LeaveType',
      required: true })
  leaveTypeId: Types.ObjectId;

  @Prop({ 
    default: true })
  isActive: boolean;

  @Prop({ 
    type: Object, 
    default: {} })
  eligibilityRules: Record<string, any>;

  @Prop({ 
    default: 0 })
  maxCarryOver: number;

  @Prop({ 
    default: true })
  requiresApproval: boolean;

  @Prop({ 
    type: Object, 
    default: {} })
  customRules: Record<string, any>;
  
  @Prop({ 
    default: false })
  allowNegativeBalance: boolean;

  @Prop({ 
    default: 0 })
  accrualRate: number;

  @Prop({
    type: String,
    enum: ['monthly', 'quarterly', 'yearly', 'none'],
    default: 'yearly',
  })
  accrualMethod: string;
}

export const LeavePolicySchema = SchemaFactory.createForClass(LeavePolicy);