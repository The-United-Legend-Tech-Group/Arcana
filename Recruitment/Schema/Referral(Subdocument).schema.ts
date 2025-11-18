import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ _id: false }) // subdocument only
export class Referral {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  referredBy: Types.ObjectId; // employee who referred

  @Prop({ type: Date, default: Date.now })
  createdAt: Date; // date of referral

  @Prop({ type: String, enum: ['internal', 'external'], required: true })
  type: string; // referral type

  @Prop({ type: String, trim: true })
  notes: string; // optional notes
}

export const ReferralSchema = SchemaFactory.createForClass(Referral);
