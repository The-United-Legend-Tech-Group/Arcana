import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ApprovalDocument = HydratedDocument<Approval>;

@Schema({ _id: false })
export class Approval {
  @Prop({
    required: true,
    enum: ['finance', 'manager', 'HR'],
    type: String
  })
  type: 'finance' | 'manager' | 'HR';

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  approvedBy?: Types.ObjectId;

  @Prop({ type: Date })
  approvedAt?: Date;

  @Prop({
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  })
  status: 'pending' | 'approved' | 'rejected';
}

export const ApprovalSchema = SchemaFactory.createForClass(Approval);