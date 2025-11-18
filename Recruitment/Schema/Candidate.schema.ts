import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'; 

import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose'; 

export type CandidateDocument = HydratedDocument<Candidate>;

@Schema({ timestamps: true, collection: 'candidates' })
export class Candidate {
  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: Number, required: true, min: 0 })
  age: number;

  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  })
  email: string;

  @Prop({ type: String, required: true, unique: true })
  password: string;

  @Prop({
    type: String,
    required: false,
    trim: true,
    match: [/^\+?[0-9]{7,15}$/, 'Please provide a valid phone number']
  })
  phoneNumber: string;

  @Prop({ type: String, required: false, trim: true })
  address: string;

  @Prop({
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: false
  })
  gender: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'CandidateApplication' }] })
  candidateApplications: Types.ObjectId[];
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate);