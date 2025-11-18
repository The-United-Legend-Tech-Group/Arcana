//deprecated
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PayTypeDocument = HydratedDocument<PayType>;

export enum PayTypeStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
}

export enum PayTypeEnum {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CONTRACT = 'contract_based',
}

@Schema({ timestamps: true })
export class PayType {
  @Prop({ required: true, enum: PayTypeEnum })
  type: PayTypeEnum; // e.g. hourly, daily, weekly, monthly, contract-based

  @Prop({ required: true, enum: PayTypeStatus, default: PayTypeStatus.DRAFT })
  status: PayTypeStatus; // workflow status
}

export const PayTypeSchema = SchemaFactory.createForClass(PayType);
