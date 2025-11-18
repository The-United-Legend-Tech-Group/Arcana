import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument,Types } from 'mongoose';

export type FinalizedPayslipDocument = HydratedDocument<FinalizedPayslip>;

@Schema({ timestamps: true })
export class FinalizedPayslip {
  @Prop({ required: true })
  employee: string; // Employee name (e.g., "John Doe")

 @Prop({ type: Types.ObjectId, ref: 'Employee', required: true, index: true })
 employee_id: Types.ObjectId;

  @Prop({ 
    required: true,
    enum: ['Signing Bonus', 'Termination', 'Resignation']
  })
  type: 'Signing Bonus' | 'Termination' | 'Resignation';

  @Prop({ 
    required: true,
    enum: ['System Processed', 'Under Review', 'Approved', 'Rejected'],
    default: 'System Processed'
  })
  status: 'System Processed' | 'Under Review' | 'Approved' | 'Rejected';

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ 
    required: true,
    enum: ['USD', 'GBP'],
    default: 'USD'
  })
  currency: 'USD' | 'GBP';

  @Prop({ required: true })
  processed_date: Date;

  @Prop({ required: true })
  effective_date: Date;
}

export const FinalizedPayslipSchema = SchemaFactory.createForClass(FinalizedPayslip);
