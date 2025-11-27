import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'; 

import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose'; 


export type JobRequisitionDocument = HydratedDocument<JobRequisition>;

@Schema({ 
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
})
export class JobRequisition {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'Job' })
  jobId: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true })
  jobName: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'Department' })
  departmentId: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true })
  departmentName: string;

  @Prop({ type: String, required: true, trim: true })
  locationName: string;

  @Prop({ type: Number, required: true, min: 1 })
  openings: number;

  @Prop({ type: [String], default: [] })
  qualifications: string[];

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Employee', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  lastUpdated: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'HiringTemplate', required: true })
  hiringTemplateId: Types.ObjectId;

  @Prop({ type: Boolean })
  IsAccepted: boolean;
}

export const JobRequisitionSchema = SchemaFactory.createForClass(JobRequisition);
