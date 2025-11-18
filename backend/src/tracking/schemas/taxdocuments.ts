// src/schemas/taxdocument.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TaxDocumentDocument = HydratedDocument<TaxDocument>;

@Schema({ timestamps: true })
export class TaxDocument {
  @Prop({ required: true, unique: true })
  // Business-friendly ID for the document (e.g., "TD-2025-000123").
  // If you prefer sequential numbers, implement a counter to populate this.
  document_id: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true, index: true })
  // Reference to the employee who owns this tax document.
  // REQ-PY-15: employees must be able to download personal tax docs.
  employee_id: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['Annual Tax Statement', 'Monthly Tax Summary', 'Quarterly Tax Report']
  })
  document_type: 'Annual Tax Statement' | 'Monthly Tax Summary' | 'Quarterly Tax Report';

  @Prop({ required: true })
  // Tax year (e.g., 2025).
  year: number;

  @Prop({ required: false })
  // Optional period label for monthly/quarterly documents (e.g., '2025-03' or 'Q1-2025').
  period?: string;

  @Prop({ required: true })
  // Downloadable PDF link (file storage).
  file_url: string;

  @Prop({
    required: false,
    type: {
      by: { type: String },
      at: { type: Date },
      note: { type: String }
    },
    default: null
  })
  // Who or what generated the document (optional, for audit).
  generated_by?: { by?: string; at?: Date; note?: string };

  @Prop({
    required: false,
    type: {
      by: { type: String },
      at: { type: Date },
      note: { type: String }
    },
    default: null
  })
  // Optional finance approval metadata (keep if finance reviews docs).
  approved_by?: { by?: string; at?: Date; note?: string };

  @Prop({
    required: true,
    type: {
      totalTax: { type: Number, required: true, min: 0 },
      appliedRule: { type: String, required: true }, // rule id or short description
      components: [
        {
          code: { type: String, required: true },
          amount: { type: Number, required: true, min: 0 },
          description: { type: String, required: false }
        }
      ]
    },
    default: null
  })
  // Simplified tax breakdown:
  // - totalTax: required (shows total deductions)
  // - appliedRule: required (the rule or law reference used)
  // - components: optional detailed items (e.g., income tax, social insurance)
  taxBreakdown?: {
    totalTax: number;
    appliedRule: string;
    components?: { code: string; amount: number; description?: string }[];
  };
}

export const TaxDocumentSchema = SchemaFactory.createForClass(TaxDocument);

// Suggested index
// TaxDocumentSchema.index({ employee_id: 1, year: -1, document_type: 1 });
