import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DocumentDocument = HydratedDocument<Document>;

@Schema({ timestamps: true })
export class Document {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  EmployeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Contract', required: true })
  contractId: Types.ObjectId;

  @Prop({
    required: true,
    enum: [
      'signed_contract',
      'national_id',
      'passport',
      'visa',
      'resume',
      'medical_form',
      'tax_form',
      'other',
    ],
  })
  documentType: string;

  @Prop({ required: true })
  fileUrl: string;

  // ✅ HR approval flag
  @Prop({ default: false })
  accepted: boolean;

  // Optional: who approved it and when
  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  approvedBy: Types.ObjectId;

  @Prop({ default: null })
  approvedAt: Date;

  @Prop({ default: Date.now })
  uploadedAt: Date;
}

export const DocumentSchema = SchemaFactory.createForClass(Document);