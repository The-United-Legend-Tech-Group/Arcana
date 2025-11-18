import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AllowanceDocument = HydratedDocument<Allowance>;

export enum AllowanceStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
}

@Schema({ timestamps: true })
export class Allowance {
  @Prop({ required: true, type: String })
  type: string;
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
