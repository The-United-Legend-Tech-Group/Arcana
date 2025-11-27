import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PayslipDocument = HydratedDocument<Payslip>;


@Schema({ timestamps: true })
export class Payslip {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employee_id: Types.ObjectId; // References Employee.employee_id

  @Prop({ required: true})
  period: Date; // e.g., "2024-01"

  @Prop({ 
    required: true,
    enum: ['Paid', 'Draft', 'Pending', 'Disputed'],
    default: 'Draft'
  })
  status: 'Paid' | 'Draft' | 'Pending' | 'Disputed'; // REQ-PY-2: Track disputed status

  // Earnings
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  base_salary: number; // Snapshot from Employee.base_salary at payslip generation

  @Prop({ type: Types.ObjectId, ref: 'Leave', required: true })
  leave_encashment: Types.ObjectId; // REQ-PY-5: Compensation for unused or encashed leave days

  @Prop({ type: Types.ObjectId, ref: 'Allowance', required: true })
  transportation_allowance: Types.ObjectId; // REQ-PY-7: Transportation or commuting compensation

  // Totals
  @Prop({ required: true, min: 0 })
  gross_pay: number;

  @Prop({ required: true, min: 0 })
  final_dispersment: number;

  // Deductions (simplified as numeric totals for now)
  @Prop({ type: Types.ObjectId, ref: 'TaxRule', required: true })
  tax_deductions: Types.ObjectId; // Total tax deductions for the period

  @Prop({ type: Types.ObjectId, ref: 'InsuranceBracket', required: true })
  insurance_deductions: Types.ObjectId; // Total insurance deductions for the period

  @Prop({ required: true, min: 0, default: 0 })
  misconduct_deductions: number; // Total misconduct-related deductions for the period

  @Prop({ required: true, min: 0, default: 0 })
  unpaid_leave_deductions: number; // REQ-PY-11: Deductions for unpaid leave days

  @Prop({ 
    required: true,
    enum: ['USD', 'GBP'],
    default: 'USD'
  })
  currency: 'USD' | 'GBP';
}

export const EmployeePayslipSchema = SchemaFactory.createForClass(Payslip);