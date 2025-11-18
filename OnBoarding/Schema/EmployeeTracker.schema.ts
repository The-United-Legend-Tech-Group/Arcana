import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'; 

import { HydratedDocument, Types } from 'mongoose'; 

 

export type EmployeeTrackerDocument = HydratedDocument<EmployeeTracker>; 

  

@Schema({ timestamps: true }) 

export class EmployeeTracker { 

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true }) 

  EmployeeID: Types.ObjectId; 

  

  @Prop({ type: [{ type: Types.ObjectId, ref: 'OnboardingTaskInstance' }] }) 

  onboardingTasks: Types.ObjectId[]; 

  

  @Prop({ 

    enum: ['pending', 'in_progress', 'completed'], 

    default: 'pending', 

  }) 

  status: string; 

  

  @Prop() 

  startDate: Date; 

  

  @Prop() 

  endDate: Date; 

  

  @Prop({ type: Types.Map }) 

  meta: any; 

} 

  

export const EmployeeTrackerSchema = SchemaFactory.createForClass(EmployeeTracker); 

  

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 