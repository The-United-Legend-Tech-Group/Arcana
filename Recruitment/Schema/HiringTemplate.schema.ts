import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'; 

import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose'; 


export type StageDocument = HydratedDocument<Stage>;

@Schema({ _id: false })
export class Stage {
  @Prop({ type: String })
  name: string;

  @Prop({ type: Number })
  weight: number;

  @Prop({ type: Boolean })
  IsPassed: boolean;
}

export const StageSchema = SchemaFactory.createForClass(Stage);

export type HiringTemplateDocument = HydratedDocument<HiringTemplate>;

@Schema({ timestamps: true, collection: 'hiringtemplates' })
export class HiringTemplate {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'JobRequisition', required: true })
  requisitionId: Types.ObjectId;

  @Prop({ type: [StageSchema] })
  stages: Stage[];

  @Prop({ type: String, required: true, min: 0 })
  lastStageName: string;
}

export const HiringTemplateSchema = SchemaFactory.createForClass(HiringTemplate);