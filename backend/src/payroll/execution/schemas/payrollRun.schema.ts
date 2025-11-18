import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from 'mongoose';

export type PayrollRunDocument = HydratedDocument<PayrollRun>;

@Schema({ timestamps: true })
export class PayrollRun {
  @Prop({ required: true, unique: true, index: true })
  run_id: string;

  @Prop({ required: true, index: true })
  period: string;

  @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
  entity: Types.ObjectId; // Entity name (e.g., "Company A")

  @Prop({ required: true })
  country: string; // Country code (e.g., "US", "UK")

  @Prop({ 
    required: true,
    enum: ['Draft', 'Pending Manager Approval', 'Paid'],
    default: 'Draft'
  })
  status: 'Draft' | 'Pending Manager Approval' | 'Paid' | 'Under Review';

  @Prop({ required: true, min: 0, default: 0 })
  employees_count: number;

  @Prop({ required: true, min: 0, default: 0 })
  exceptions_count: number;

  @Prop({ required: true, min: 0 })
  total_net_pay: number;

  @Prop({ 
    required: true,
    enum: ['USD', 'GBP'],
    default: 'USD'
  })
  currency: 'USD' | 'GBP';

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  created_by: Types.ObjectId;

  @Prop({ required: true, default: Date.now })
  created_date: Date;
}

export const PayrollRunSchema = SchemaFactory.createForClass(PayrollRun);