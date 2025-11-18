import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AllowanceDocument = HydratedDocument<Allowance>;

export enum AllowanceStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
}

export enum AllowanceType {
  TRANSPORTATION = 'transportation',
  HOUSING = 'housing',
  MEAL = 'meal',
  OTHER = 'other',
}

@Schema({ timestamps: true })
export class Allowance {
  @Prop({ required: true, enum: AllowanceType })
  type: AllowanceType; // e.g. "transportation", "housing"

  @Prop({ required: true })
  amount: number; // hard-coded fixed value

  @Prop({
    required: true,
    enum: AllowanceStatus,
    default: AllowanceStatus.DRAFT,
  })
  status: AllowanceStatus; // workflow status
}

export const AllowanceSchema = SchemaFactory.createForClass(Allowance);
