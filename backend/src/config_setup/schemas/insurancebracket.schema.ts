import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type InsuranceBracketDocument = HydratedDocument<InsuranceBracket>;

export enum InsuranceBracketStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
}

@Schema({ timestamps: true })
export class InsuranceBracket {
  @Prop({ required: true })
  bracketName: string; // e.g. "Health Insurance Bracket A"

  @Prop({
    required: true,
    enum: InsuranceBracketStatus,
    default: InsuranceBracketStatus.DRAFT,
  })
  status: InsuranceBracketStatus;

  @Prop({ required: true })
  salaryRangeMin: number; // lower bound of salary

  @Prop({ required: true })
  salaryRangeMax: number; // upper bound of salary

  @Prop({ required: true })
  contributionPercent: number; // overall % contribution
}

export const InsuranceBracketSchema =
  SchemaFactory.createForClass(InsuranceBracket);

  //As an HR Manager,
  //  I want to review and update insurance bracket configurations when policies or regulations change, 
  //  so that payroll calculations remain accurate, compliant, and reflect the most current insurance requirements.  
  //  (Approve/ reject view,Edit, delete)