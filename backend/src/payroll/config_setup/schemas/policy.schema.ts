import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PayrollPolicyDocument = HydratedDocument<Policy>;

export enum PolicyStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
}

export enum PolicyType {
  MISCONDUCT = 'misconduct',
  LEAVE = 'leave',
  ALLOWANCE = 'allowance',
}

export enum Applicability {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  TEMPORARY = 'temporary',
  ALL = 'all',         // policy applies to all employees
}

@Schema({ timestamps: true })
export class Policy {
  @Prop({ required: true })
  policyName: string;

  @Prop({ required: true, enum: PolicyType })
  type: PolicyType;

  @Prop()
  policyDescription?: string; // free text description

  @Prop({ required: true, enum: PolicyStatus, default: PolicyStatus.DRAFT })
  status: PolicyStatus;

  @Prop({ required: true })
  effectiveDate: Date; // (when policy starts applying)

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  lastModifiedBy?: Types.ObjectId; // reference to employee/user who last edited

  @Prop()
  lastModifiedName?: string; // optional, can be joined later

  @Prop()
  lawReference?: string; // optional legal reference e.g. "Employment Act Section 12.3"

  @Prop({
    type: {
      percentage: { type: Number },
      fixedAmount: { type: Number },
      threshold: { type: Number },
    },
  })
  ruleDefinition: {
    percentage?: number;
    fixedAmount?: number;
    threshold?: number;
  };

  @Prop({ enum: Applicability, required: true })
  applicability: Applicability;

  @Prop({ default: false })
  autoApply: boolean; // auto-apply on current payroll runs
}

export const PolicySchema = SchemaFactory.createForClass(Policy);
