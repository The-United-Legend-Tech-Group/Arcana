import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Criteria, CriteriaSchema } from './Criteria(Subdocument).schema';

@Schema({ timestamps: true })
export class Evaluation {
  @Prop({ type: Types.ObjectId, ref: 'CandidateApplication', required: true })
  applicationId: Types.ObjectId; // the candidate application being evaluated

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true }) // or 'HREmployee' if that model exists
  interviewerId: Types.ObjectId; // interviewer giving the evaluation

  @Prop({
    type: [CriteriaSchema],
    required: true,
    validate: {
      validator: (arr: Criteria[]) => arr.length > 0,
      message: 'At least one evaluation criterion is required.',
    },
  })
  criteria: Criteria[]; // list of criteria scored by the interviewer
}

export type EvaluationDocument = Evaluation & Document;
export const EvaluationSchema = SchemaFactory.createForClass(Evaluation);
