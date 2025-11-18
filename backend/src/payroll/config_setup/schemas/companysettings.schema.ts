import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CompanySettingsDocument = HydratedDocument<CompanySettings>;

export enum CompanySettingsStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
}

@Schema({ timestamps: true })
export class CompanySettings {
  @Prop({ required: true })
  payDate: string; // e.g. "25th of each month"

  @Prop({ required: true })
  timeZone: string; // e.g. "Africa/Cairo"

  @Prop({ required: true })
  currency: string; // e.g. "EGP"

  @Prop({
    required: true,
    enum: CompanySettingsStatus,
    default: CompanySettingsStatus.DRAFT,
  })
  status: CompanySettingsStatus;
}

export const CompanySettingsSchema =
  SchemaFactory.createForClass(CompanySettings);
