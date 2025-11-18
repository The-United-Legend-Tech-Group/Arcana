import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'; 

import { HydratedDocument, Types } from 'mongoose'; 

 

export type AssetDocument = HydratedDocument<Asset>; 

  

@Schema({ timestamps: true }) 

export class Asset { 

  @Prop({ required: true }) 

  name: string; 

  

  @Prop({ required: true }) // 'equipment','desk','access_card' 

  type: string; 

  

  @Prop({ 

    enum: ['available', 'reserved', 'assigned', 'maintenance'], 

    default: 'available', 

  }) 

  status: string; 

  

  @Prop({ type: Types.ObjectId, ref: 'Employee' }) 

  assignedToEmployeeID: Types.ObjectId; 

  

  @Prop() 

  location: string; 

  

  @Prop() 

  serialNumber: string; 

  

  @Prop({ type: Types.Map }) 

  meta: any; 

} 

  

export const AssetSchema = SchemaFactory.createForClass(Asset); 
