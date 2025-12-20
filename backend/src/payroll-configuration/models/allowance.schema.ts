import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
<<<<<<< HEAD:backend/src/payroll/config_setup/models/allowance.schema.ts
import { EmployeeProfile as Employee } from '../../../employee-profile/models/employee-profile.schema';
=======
import { EmployeeProfile as Employee } from '../../employee-subsystem/employee/models/employee-profile.schema';
>>>>>>> 2670e2ef0a6367832cc370e5aaba37b2ffc6dbb4:backend/src/payroll-configuration/models/allowance.schema.ts
import { ConfigStatus } from '../enums/payroll-configuration-enums';
export type allowanceDocument = HydratedDocument<allowance>;

@Schema({ timestamps: true })
export class allowance {
  @Prop({ required: true, }) // unique removed for execution module
  name: string; // allowance name like:  Housing Allowance, Transport Allowance
  @Prop({ required: true, min: 0 })
  amount: number;
  @Prop({
    required: true,
    type: String,
    enum: ConfigStatus,
    default: ConfigStatus.DRAFT,
  })
  status: ConfigStatus; // draft, approved, rejected

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name })
  createdBy?: mongoose.Types.ObjectId;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name })
  approvedBy?: mongoose.Types.ObjectId;
  @Prop({})
  approvedAt?: Date;
}

export const allowanceSchema = SchemaFactory.createForClass(allowance);
