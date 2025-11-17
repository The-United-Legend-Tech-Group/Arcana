import { Global, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";
import mongooseConfigFactory from "./mongoose.config";

import {
  AttendanceRecord,
  AttendanceRecordSchema,
} from "../time-mangment-subsystem/attendance/src/schemas/attendance-record.schema";
import {
  ShiftAssignment,
  ShiftAssignmentSchema,
} from "../time-mangment-subsystem/attendance/src/schemas/shift-assignment.schema";
import {
  ShiftType,
  ShiftTypeSchema,
} from "../time-mangment-subsystem/attendance/src/schemas/shift-type.schema";
import {
  TimeSlot,
  TimeSlotSchema,
} from "../time-mangment-subsystem/attendance/src/schemas/time-slots.schema";

@Global()
@Module({
  imports: [
    ConfigModule,
    // Centralized connection — app-wide
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: mongooseConfigFactory,
    }),

    // Register schemas (models) so other modules can `@InjectModel()` them
    MongooseModule.forFeature([
      { name: AttendanceRecord.name, schema: AttendanceRecordSchema },
      { name: ShiftAssignment.name, schema: ShiftAssignmentSchema },
      { name: ShiftType.name, schema: ShiftTypeSchema },
      { name: TimeSlot.name, schema: TimeSlotSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
