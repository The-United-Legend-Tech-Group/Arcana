import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  actorId: Types.ObjectId; // Who performed the action

  @Prop({ type: Types.ObjectId, ref: 'LeaveRequest' })
  leaveRequestId: Types.ObjectId; // Optional: can also track entitlement changes

  @Prop({ required: true })
  action: string; // "created", "updated", "approved", "rejected"

  @Prop({ type: Object })
  oldValue: Record<string, any>;

  @Prop({ type: Object })
  newValue: Record<string, any>;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
