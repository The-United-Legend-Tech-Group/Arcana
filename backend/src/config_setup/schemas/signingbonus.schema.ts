import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SigningBonusDocument = HydratedDocument<SigningBonus>;

export enum SigningBonusStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
}

@Schema({ timestamps: true })
export class SigningBonus {
  @Prop({ required: true })
  bonusName: string; // e.g. "New Hire Bonus"

  @Prop({ required: true })
  amount: number; // fixed numeric value

  @Prop({
    required: true,
    enum: SigningBonusStatus,
    default: SigningBonusStatus.DRAFT,
  })
  status: SigningBonusStatus;
}

export const SigningBonusSchema = SchemaFactory.createForClass(SigningBonus);
