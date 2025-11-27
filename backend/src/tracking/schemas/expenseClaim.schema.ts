import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ExpenseClaimDocument = HydratedDocument<ExpenseClaim>;

@Schema({ timestamps: true })
export class ExpenseClaim {
  @Prop({ required: true, unique: true })
  claim_id: string;

@Prop({ type: Types.ObjectId, ref: 'Employee', required: true, index: true })
employee_id: Types.ObjectId;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  // Overall claim status & workflow stage
  @Prop({
    required: true,
    enum: [
      'PendingSpecialist', // Newly submitted, waiting for Payroll Specialist
      'PendingManager',    // Approved by Specialist, waiting for Payroll Manager
      'Approved',          // Fully approved (Specialist + Manager as required)
      'Rejected'           // Rejected at any stage
    ],
    default: 'PendingSpecialist'
  })
  status: 'PendingSpecialist' | 'PendingManager' | 'Approved' | 'Rejected';

  @Prop({ required: true })
  date: Date; 

  @Prop({ required: true, default: false })
  finance_notified: boolean;

  // Refund Tracking (REQ-PY-46)
  @Prop({ required: false, min: 0 })
  refund_amount?: number;

  @Prop({ 
    required: false,
    enum: ['Pending', 'Processed', 'Included in Payroll']
  })
  refund_status?: 'Pending' | 'Processed' | 'Included in Payroll';

  @Prop({ required: false })
  refund_payment_date?: Date; // Date when refund was actually paid (REQ-PY-18: track payment status)
}

export const ExpenseClaimSchema = SchemaFactory.createForClass(ExpenseClaim);
