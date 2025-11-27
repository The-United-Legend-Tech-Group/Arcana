import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ _id: false }) // subdocument only
export class Feedback {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  interviewerId: Types.ObjectId; // the interviewer giving this feedback

  @Prop({ type: Number, min: 0, max: 5 })
  rating: number; // rating out of 5

  @Prop({ type: String, trim: true })
  comment: string; // optional textual comment
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
