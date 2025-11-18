import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Feedback, FeedbackSchema } from './FeedBack(Subdocument).schema'; // import Feedback
import { Criteria, CriteriaSchema } from './Criteria(Subdocument).schema'; // import CriteriaSnapshot

@Schema({ timestamps: true })
export class InterviewSession {
  @Prop({ type: Types.ObjectId, ref: 'Requisition', required: true })
  requisitionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Candidate', required: true })
  candidateApplicationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  recruiterId: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  interviewerIds: Types.ObjectId[];

  @Prop({ type: String, required: true })//JOE
  timeSlotId: String;

  @Prop({ type: Date })
  interviewDate: Date;

  @Prop({ type: Date, required: true })
  startTime: Date;

  @Prop({ type: Date, required: true })
  endTime: Date;

  @Prop({ type: String, enum: ['in-person', 'online'], default: 'online' })
  mode: String;

  @Prop({ type: String })
  location: String;

  @Prop({ 
    type: String, 
    enum: ['scheduled', 'rescheduled', 'cancelled', 'completed'], 
    default: 'scheduled' 
  })
  status: String;

  @Prop({ type: [FeedbackSchema], default: [] })
  feedback: Feedback[];

  @Prop({ type: [CriteriaSchema], default: [] })
sessionCriteria: Criteria[]; // all interviewers see these

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Assessment' }] })
  evaluations: Types.ObjectId[];
}

export type InterviewSessionDocument = InterviewSession & Document;
export const InterviewSessionSchema = SchemaFactory.createForClass(InterviewSession);
