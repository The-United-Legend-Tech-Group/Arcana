import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EmployeeLifecycleDocument = HydratedDocument<EmployeeLifecycle>;

export enum EmployeeCondition {
  NORMAL = 'normal', // default state
  NEWLY_HIRED = 'newly_hired',
  TERMINATED = 'terminated',
  RESIGNED = 'resigned',
}

export enum PayrollStatus {
  DRAFT = 'draft',
  APPROVED = 'approved',
}

@Schema({ timestamps: true })
export class EmployeeLifecycle {
  // Reference to contract in recruitment/onboarding/offboarding
  @Prop({ type: Types.ObjectId, ref: 'Contract', required: true })
  contractId: Types.ObjectId;

  @Prop({
    type: String,
    enum: EmployeeCondition,
    default: EmployeeCondition.NORMAL,
    required: true,
  })
  condition: EmployeeCondition;

  // Status set by payroll manager (draft or approved)
  @Prop({
    type: String,
    enum: PayrollStatus,
    default: PayrollStatus.DRAFT,
    required: true,
  })
  status: PayrollStatus;

  // Indicates whether this record has been processed in payroll
  @Prop({ type: Boolean, default: false })
  processed: boolean;

  // Timestamp when payroll processing occurred
  @Prop({ type: Date })
  processedAt?: Date;
}

export const EmployeeLifecycleSchema =
  SchemaFactory.createForClass(EmployeeLifecycle);
