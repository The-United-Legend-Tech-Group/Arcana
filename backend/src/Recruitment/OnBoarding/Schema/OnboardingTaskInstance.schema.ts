import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'; 

import { HydratedDocument, Types } from 'mongoose'; 

 

export type OnboardingTaskInstanceDocument = HydratedDocument<OnboardingTaskInstance>; 

  

@Schema({ timestamps: true }) 

export class OnboardingTaskInstance { 

  @Prop({ type: Types.ObjectId, ref: 'EmployeeTracker', required: true }) 

  EmployeeTrackerId: Types.ObjectId; 

  

  @Prop() // dont think i need it 

  templateTaskKey: string; 

  

  @Prop({ required: true }) 

  title: string; 

  

  @Prop() 

  description: string; 

  

  @Prop({ 

    enum: ['document', 'action', 'training', 'meeting', 'other'], 

    default: 'action', 

  }) 

  taskType: string; 

  

  @Prop({ type: Types.ObjectId, ref: 'Employee' }) 

  assignedToEmployeeId: Types.ObjectId; 

  

  @Prop() 

  assignedToRole: string; 

  

  @Prop({ 

    enum: ['pending', 'in_progress', 'completed', 'skipped', 'blocked'], 

    default: 'pending', 

  }) 

  status: string; 

  

  @Prop({ default: true }) 

  required: boolean; 

  

  @Prop() 

  dueDate: Date; 

  

  @Prop() 

  completedAt: Date; 

  

  @Prop({ type: Types.ObjectId, ref: 'Employee' }) 

  completedBy: Types.ObjectId; 

  

  @Prop({ type: [{ type: Types.ObjectId, ref: 'OnboardingDocument' }] }) 

  attachments: Types.ObjectId[]; 

  

  @Prop({ type: Types.Map }) 

  meta: any; 

} 

  

export const OnboardingTaskInstanceSchema = SchemaFactory.createForClass(OnboardingTaskInstance); 