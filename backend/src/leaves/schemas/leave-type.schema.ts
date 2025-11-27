import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LeaveTypeDocument = LeaveType & Document;

@Schema({
  timestamps: true,
})
export class LeaveType {
  @Prop({ required: true, unique: true })
  name: string; 
  
  @Prop({
    required: true,
    default: false
  })
  isPaid: boolean;

  @Prop({
    required: true,
    default: true
  })
  isActive: boolean;

  @Prop({
    required: true,
    default: false
  })
  requiresDocument: boolean;

  @Prop({
    required: false,
    trim: true,
    default: ''
  })
  description: string;
}

export const LeaveTypeSchema = SchemaFactory.createForClass(LeaveType);