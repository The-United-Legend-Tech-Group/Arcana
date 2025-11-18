import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TaxRuleDocument = HydratedDocument<TaxRule>;

export enum TaxRuleStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
}

@Schema({ timestamps: true })
export class TaxRule {
  @Prop({ required: true })
  ruleName: string; // e.g. "Progressive Tax Rule"

  @Prop({ required: true, enum: TaxRuleStatus, default: TaxRuleStatus.DRAFT })
  status: TaxRuleStatus; // workflow status (create draft, view all, edit when laws change)

  @Prop()
  description?: string; // optional explanation of the rule

  @Prop({ required: true })
  taxPercentage: number; // e.g. 15 for 15%
}

export const TaxRuleSchema = SchemaFactory.createForClass(TaxRule);
