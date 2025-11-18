import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false }) // subdocument only
export class StageHistory {
  @Prop({ type: String, required: true })
  name: string; // stage name

  @Prop({ type: Number, required: true })
  weight: number; // importance/weight of the stage

  @Prop({ type: Boolean })
  isPassed: boolean; // whether the stage was passed
}

export const StageHistorySchema = SchemaFactory.createForClass(StageHistory);
