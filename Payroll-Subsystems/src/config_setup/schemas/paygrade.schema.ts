import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PayGradeDocument = HydratedDocument<PayGrade>;

export enum PayGradeStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
}

@Schema({ timestamps: true })
export class PayGrade {
  @Prop({ required: true })
  position: string; // e.g. "Senior Mobile Developer"

  @Prop({ required: true })
  grossSalary: number; // hard-coded salary = basePay + allowances

  @Prop({ required: true, enum: PayGradeStatus, default: PayGradeStatus.DRAFT })
  status: PayGradeStatus; // workflow status
}

export const PayGradeSchema = SchemaFactory.createForClass(PayGrade);
