<<<<<<< HEAD
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
=======
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
>>>>>>> upstream/main

export type ScheduleRuleDocument = HydratedDocument<ScheduleRule>;

@Schema()
<<<<<<< HEAD
export class ScheduleRule{
    @Prop({required: true})
    name: string;

    @Prop({required: true})
    pattern: string;

    @Prop({default: true})
    active: boolean;
=======
export class ScheduleRule {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  pattern: string;

  @Prop({ default: true })
  active: boolean;
>>>>>>> upstream/main
}

export const ScheduleRuleSchema = SchemaFactory.createForClass(ScheduleRule);
