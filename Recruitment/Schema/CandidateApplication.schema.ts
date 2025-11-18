import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { StageHistory, StageHistorySchema } from './Stage-History(Subdocument).schema';
import { Referral, ReferralSchema } from './Referral(Subdocument).schema';

@Schema({ timestamps: true })
export class CandidateApplication {
  @Prop({ type: Types.ObjectId, ref: 'Candidate', required: true })
  candidateId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'JobRequisition', required: true })
  requisitionId: Types.ObjectId;

  @Prop({ type: String, required: true })
  currentStage: string; // current stage of the application

  @Prop({ type: [StageHistorySchema], default: [] })
  stageHistory: StageHistory[];

  @Prop({ type: Types.ObjectId, ref: 'Offer' })
  offerId: Types.ObjectId; // optional linked offer

  @Prop({ type: [ReferralSchema], default: [] })
  referrals: Referral[];

  @Prop({ type: Types.ObjectId, ref: 'CommunicationLogs' })
  communicationLogID: Types.ObjectId; // link to communication logs

  @Prop({ type: Number, default: 0 })
  avgScore: number; // average evaluation score
}

export type CandidateApplicationDocument = CandidateApplication & Document;
export const CandidateApplicationSchema = SchemaFactory.createForClass(CandidateApplication);
