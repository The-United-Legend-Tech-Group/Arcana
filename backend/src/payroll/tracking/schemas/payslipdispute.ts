// src/schemas/payslip-dispute.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PayslipDisputeDocument = HydratedDocument<PayslipDispute>;

/**
 * Simplified PayslipDispute schema per request.
 * - approvals / comments / supportDocs / resolution metadata removed.
 * - status is the single source of truth for workflow.
 * - payslip_id is required and references EmployeePayslip.
 * - finance_notified kept to indicate Finance was informed.
 *
 * IMPORTANT: this design intentionally minimizes stored metadata. If you later
 * need auditability (who approved and when), you should reintroduce approval fields
 * or rely on AuditLog elsewhere in the system.
 */
@Schema({ timestamps: true })
export class PayslipDispute {
  @Prop({ required: true, unique: true })
  // Business-friendly dispute id for traceability.
  // REQ-PY-16; BR36 (traceability — identifier).
  dispute_id: string;

  @Prop({ 
    type: Types.ObjectId, 
    ref: 'EmployeePayslip', 
    required: true, 
    index: true 
  })
  // REQUIRED: authoritative link to the disputed payslip (provides employee context).
  // REQ-PY-16; BR36.
  payslip_id: Types.ObjectId;

  @Prop({ required: true })
  // Employee-provided explanation of the dispute.
  // REQ-PY-16.
  description: string;

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
  // Simplified workflow status (single source of truth for routing and visibility).
  // REQ-PY-2 (employee visibility), REQ-PY-16, REQ-PY-39..41.
  status: 'PendingSpecialist' | 'PendingManager' | 'Approved' | 'Rejected';

  @Prop({
    type: [
      {
        lineCode: { type: String, required: true },
        expectedAmount: { type: Number, required: true, min: 0 }
      }
    ],
    required: false,
    default: []
  })
  // Line-level requested adjustments (used to calculate corrections or refunds).
  // REQ-PY-16; REQ-PY-45.
  requestedAdjustments?: { lineCode: string; expectedAmount: number }[];

  @Prop({ required: true, default: false })
  // Explicit flag showing Finance has been notified of an approved dispute.
  // Kept for operational clarity / queueing (REQ-PY-41).
  finance_notified: boolean;

  @Prop({ required: false, min: 0 })
  // Refund amount to be paid if dispute results in a refund.
  // REQ-PY-45; REQ-PY-18 (employee tracks refund amount).
  refund_amount?: number;

  @Prop({
    required: false,
    enum: ['Pending', 'Processed', 'Included in Payroll']
  })
  // Refund lifecycle state for employee visibility.
  // REQ-PY-18; REQ-PY-45.
  refund_status?: 'Pending' | 'Processed' | 'Included in Payroll';

  @Prop({ required: false })
  // Date when refund was actually paid (if applicable).
  // REQ-PY-18 (payment tracking).
  refund_payment_date?: Date;

  // createdAt / updatedAt provided by timestamps (audit timeline).
}

export const PayslipDisputeSchema = SchemaFactory.createForClass(PayslipDispute);

// Suggested index(s) if desired:
// PayslipDisputeSchema.index({ dispute_id: 1 }, { unique: true });
// PayslipDisputeSchema.index({ payslip_id: 1, status: 1 });
