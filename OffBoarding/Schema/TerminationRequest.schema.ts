import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose';

export type TerminationRequestDocument = HydratedDocument<TerminationRequest>;

@Schema({ collection: 'terminationrequests' })
export class TerminationRequest {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  requestedBy: Types.ObjectId;

  @Prop({ type: String, required: true })
  reason: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'PerformanceWarning' }] })
  evidence: Types.ObjectId[];

  @Prop({ type: Date })
  effectiveDate: Date;

  @Prop({
    type: String,
    enum: ['draft', 'under_review', 'approved', 'rejected', 'cancelled'],
    default: 'under_review'
  })
  status: string;

  @Prop({
    type: [
      {
        roleOrUser: { type: String },
        approverId: { type: MongooseSchema.Types.ObjectId, ref: 'User' },
        Status: { type: Boolean, default: true },
        comments: { type: String },
        actedAt: { type: Date }
      }
    ],
    default: []
  })
  approvalFlow: any[]; 

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.Mixed })
  meta: any;
}

export const TerminationRequestSchema = SchemaFactory.createForClass(TerminationRequest);