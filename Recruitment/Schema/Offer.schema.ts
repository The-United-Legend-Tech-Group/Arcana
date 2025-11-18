import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Approval, ApprovalSchema } from './Approval.schema';

export type OfferDocument = HydratedDocument<Offer>;

@Schema({ timestamps: true })
export class Offer {
  @Prop({ required: true, trim: true, type: String })
  role: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'CandidateApplication',
    required: true
  })
  candidateApplicationId: Types.ObjectId;

  @Prop({
    type: [ApprovalSchema],
    default: [
      { type: 'finance' },
      { type: 'manager' },
      { type: 'HR' }
    ]
  })
  approvals: Approval[];

  @Prop({ type: Number, default: 0 })
  currentApprovalIndex: number; // points to the next approval in line

  @Prop({ type: String })
  body?: string;

  // stuff to receive from Mostafa
  @Prop({ type: Number })
  grossSalary?: number;

  @Prop({ type: Number })
  SigningBonus?: number;

  @Prop({ type: String })
  PayGrade?: string;
  // stuff to receive from Mostafa

  @Prop({
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  })
  overallStatus: 'pending' | 'approved' | 'rejected';

  // Timestamp virtuals
  createdAt?: Date;
  updatedAt?: Date;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);