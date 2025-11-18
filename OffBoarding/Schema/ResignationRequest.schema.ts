import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose';

export type ResignationRequestDocument = HydratedDocument<ResignationRequest>;

@Schema({ collection: 'resignationrequests' })
export class ResignationRequest {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  submittedAt: Date;

  @Prop({ type: Date, required: true })
  effectiveDate: Date;

  @Prop({ type: String })
  reason: string;

  @Prop({
    type: String,
    enum: ['submitted', 'manager_approved', 'hr_approved', 'processed', 'withdrawn'],
    default: 'submitted'
  })
  status: string;

  @Prop({ type: Date })
  withdrawalRequestedAt: Date;

  @Prop({ type: MongooseSchema.Types.Mixed })
  meta: any;
}

export const ResignationRequestSchema = SchemaFactory.createForClass(ResignationRequest);