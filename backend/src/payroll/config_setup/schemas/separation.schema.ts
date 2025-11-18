// contains both the schema of resignation and termination benefits
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SeparationBenefitDocument = HydratedDocument<SeparationBenefit>;

export enum SeparationBenefitStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
}

@Schema({ timestamps: true })
export class SeparationBenefit {
  @Prop({ required: true })
  benefitName: string; // e.g. "End of Service Gratuity"

  @Prop({ required: true })
  amount: number; // fixed numeric value or formula result

  @Prop({
    required: true,
    enum: SeparationBenefitStatus,
    default: SeparationBenefitStatus.DRAFT,
  })
  status: SeparationBenefitStatus;

  @Prop()
  effectiveDate?: Date; // usually last working day

  @Prop()
  lawReference?: string; // optional legal reference

  // Integration with Offboarding subsystem
  @Prop({ type: Types.ObjectId, ref: 'SeveranceRule', required: true })
  offboardingRuleId: Types.ObjectId; // reference to severance rules/terms
}

export const SeparationBenefitSchema =
  SchemaFactory.createForClass(SeparationBenefit);
