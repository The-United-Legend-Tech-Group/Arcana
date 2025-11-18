import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HolidayDocument = Holiday & Document;

@Schema({ timestamps: true })
export class Holiday {
  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  name: string;

  @Prop({
    type: String,
    enum: ['public', 'company', 'religious'],
    default: 'public',
  })
  category: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const HolidaySchema = SchemaFactory.createForClass(Holiday);
