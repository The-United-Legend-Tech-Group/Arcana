import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class RejectionTemplate {
  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: String, trim: true })
  stage: string;

  @Prop({ type: String, trim: true })
  reasonCode: string;

  @Prop({ type: String, required: true, trim: true })
  subject: string;

  @Prop({ type: String, required: true })
  body: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  createdBy: Types.ObjectId;
}

export type RejectionTemplateDocument = RejectionTemplate & Document;
export const RejectionTemplateSchema = SchemaFactory.createForClass(RejectionTemplate);