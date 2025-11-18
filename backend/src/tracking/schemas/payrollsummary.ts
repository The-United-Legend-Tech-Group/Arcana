// src/schemas/payrollsummary.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PayrollSummaryDocument = HydratedDocument<PayrollSummary>;

/**
 * PayrollSummary
 * - period: Date (canonical reporting date — e.g., month-end)
 * - departmentId: required reference to Department for departmental reports (REQ-PY-38)
 * - Removed generated_by & finance_approval per request (no on-document approvals)
 * - timestamps provide generation time (createdAt) for audit purposes (BR36)
 */
@Schema({ timestamps: true })
export class PayrollSummary {
  @Prop({ required: true, index: true })
  // Canonical reporting date for the summary (e.g., 2025-11-30 for Nov 2025 month-end).
  // Used for filtering, grouping and sorting in reports.
  // REQ-PY-29 (month/year summaries), BR3 (payroll cycles).
  period: Date;

  @Prop({
    type: Types.ObjectId,
    ref: 'Department',
    required: true,
    index: true
  })
  // Department (cost center) reference for which this summary was generated.
  // REQ-PY-38: payroll reports by department; use a reference for integrity.
  departmentId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['Month-End', 'Year-End']
  })
  // Distinguish monthly vs yearly summaries (affects report processing).
  // REQ-PY-29.
  summary_type: 'Month-End' | 'Year-End';

  @Prop({ required: true })
  // Downloadable file URL (PDF) of the generated summary.
  // REQ-PY-29 / REQ-PY-25.
  file_url: string;

  @Prop({
    required: true,
    enum: ['Generated', 'Approved', 'Finalized'],
    default: 'Generated'
  })
  // Document lifecycle status:
  // - Generated: created by system/tool
  // - Approved: reviewed by finance (if your process requires it)
  // - Finalized: archived/published
  // REQ-PY-29 and BR18 (finance review before payment files) — status kept minimal.
  status: 'Generated' | 'Approved' | 'Finalized';

  // ---- Optional totals for reporting (kept minimal for Milestone-1) ----
  @Prop({ required: false, min: 0 })
  // Total gross pay for the period (sum of gross across included employees).
  // REQ-PY-29, REQ-PY-25.
  total_gross_pay?: number;

  @Prop({ required: false, min: 0 })
  // Total net pay for the period (after deductions).
  // REQ-PY-29, REQ-PY-25.
  total_net_pay?: number;

  @Prop({ required: false, min: 0 })
  // Number of employees included in this summary (headcount).
  // REQ-PY-38.
  employees_count?: number;

  @Prop({ required: false, min: 0 })
  // Aggregate tax deductions for the period.
  // REQ-PY-25 (tax reports).
  total_tax_deductions?: number;

  @Prop({ required: false, min: 0 })
  // Aggregate insurance deductions (employee-side).
  // REQ-PY-25.
  total_insurance_deductions?: number;

  @Prop({ required: false, min: 0 })
  // Employer contributions (benefits) aggregate.
  // REQ-PY-25 / REQ-PY-14 (employer contributions visibility).
  total_employer_contributions?: number;

  @Prop({
    required: false,
    type: String,
    default: 'USD'
  })
  // Currency code for totals & file. Use ISO currency codes (EGP, USD, GBP, etc.).
  currency?: string;
}

export const PayrollSummarySchema = SchemaFactory.createForClass(PayrollSummary);

// Suggested indexes (optional, but helpful for large datasets):
// PayrollSummarySchema.index({ departmentId: 1, period: -1 });
// PayrollSummarySchema.index({ period: -1, status: 1 });
