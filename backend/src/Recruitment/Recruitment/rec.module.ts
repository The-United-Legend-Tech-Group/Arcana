// ...existing code...
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Approval,
  ApprovalSchema,
  Candidate,
  CandidateSchema,
  CandidateApplication,
  CandidateApplicationSchema,
  CommunicationLogs,
  CommunicationLogsSchema,
  // adjust these names below if your schema files export different identifiers:
  Criteria, // maybe CriteriaSnapshot or similar
  CriteriaSchema,
  Evaluation, // or Assessment
  EvaluationSchema,
  Feedback,
  FeedbackSchema,
  HiringTemplate,
  HiringTemplateSchema,
  InterviewSession,
  InterviewSessionSchema,
  JobRequisition,
  JobRequisitionSchema,
  Offer,
  OfferSchema,
  Referral,
  ReferralSchema,
  RejectionTemplate,
  RejectionTemplateSchema,
  StageHistory,
  StageHistorySchema,
} from './Schema/index';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Approval.name, schema: ApprovalSchema },
      { name: Candidate.name, schema: CandidateSchema },
      { name: CandidateApplication.name, schema: CandidateApplicationSchema },
      { name: CommunicationLogs.name, schema: CommunicationLogsSchema },
      { name: Criteria?.name ?? 'Criteria', schema: CriteriaSchema },
      { name: Evaluation?.name ?? 'Evaluation', schema: EvaluationSchema },
      { name: Feedback.name, schema: FeedbackSchema },
      { name: HiringTemplate.name, schema: HiringTemplateSchema },
      { name: InterviewSession.name, schema: InterviewSessionSchema },
      { name: JobRequisition.name, schema: JobRequisitionSchema },
      { name: Offer.name, schema: OfferSchema },
      { name: Referral.name, schema: ReferralSchema },
      { name: RejectionTemplate?.name ?? 'RejectionTemplate', schema: RejectionTemplateSchema },
      { name: StageHistory.name, schema: StageHistorySchema },
    ]),
  ],
})
export class RecruitmentModule {}
// ...existing code...