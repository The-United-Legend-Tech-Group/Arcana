import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false }) // subdocument only
export class Criteria {
  @Prop({ type: String, required: true, trim: true })
  name: string; // name of the criterion

  @Prop({ type: Number, required: true, min: 0 })
  score: number; // score given by interviewer

  @Prop({ type: Number, required: true, min: 0 })
  maxScore: number; // maximum possible score for this criterion
}

export const CriteriaSchema = SchemaFactory.createForClass(Criteria);
