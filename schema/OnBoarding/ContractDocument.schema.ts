import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Document } from 'mongoose';

export type ContractDocument = HydratedDocument<Contract>;

@Schema({ timestamps: true })
export class Contract {
  @Prop({ type: Types.ObjectId, ref: 'Candidate', required: true })
  candidateId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  grossSalary: number;

  @Prop({ default: 0 })
  signingBonus: number;

  @Prop()
  Paygrade: string; // this represents the job position name

  // Candidate signs digitally inside the system
  @Prop({ default: false })
  signedByCandidate: boolean;

  @Prop({ default: null })
  candidateSignature: string; // base64 or hash

  @Prop({ default: null })
  signedAt: Date;

  // Candidate uploads a signed PDF instead
  @Prop({ default: null })
  uploadedContractFile: string; // URL to the uploaded contract file

  // ✅ New attribute: start date of employment
  @Prop({ required: true })
  startDate: Date;
}

export const ContractSchema = SchemaFactory.createForClass(Contract);