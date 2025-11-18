import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true }) // automatically manage creation and update times
export class CommunicationLogs {
  @Prop({ type: Types.ObjectId, ref: 'Candidate', required: true })
  candidateId: Types.ObjectId; // links communication to a candidate

  @Prop({ type: Types.ObjectId, ref: 'Requisition' })
  requisitionId: Types.ObjectId; // optional: the job requisition related to this communication

  @Prop({ type: Types.ObjectId, ref: 'RejectionTemplate' })
  templateId: Types.ObjectId; // optional: the template used for this communication

  @Prop({ type: String, enum: ['Email', 'SMS'], default: 'Email' })
  communicationType: String; // type of communication sent
  @Prop({ type: Date, default: Date.now })
  sentAt: Date; // when the communication was sent

  @Prop({ type: String, trim: true })
  subject: String; // optional subject, trimmed to avoid accidental spaces

  @Prop({ type: String, trim: true })
  body: string; // optional message body, trimmed

  @Prop({ type: String, enum: ['Sent', 'Failed'], default: 'Sent' })
  status: string; // whether the communication was sent successfully
}

export type CommunicationLogsDocument = CommunicationLogs & Document;
export const CommunicationLogsSchema = SchemaFactory.createForClass(CommunicationLogs);