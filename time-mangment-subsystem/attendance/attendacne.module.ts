// src/app.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AttendanceController } from "./attendance.controller";
import { AttendanceService } from "./attendance.service";
import {
  AttendanceRecord,
  AttendanceRecordSchema,
} from "./src/schemas/attendance-record.schema";
import {
  ShiftAssignment,
  ShiftAssignmentSchema,
} from "./src/schemas/shift-assignment.schema";
import { ShiftType, ShiftTypeSchema } from "./src/schemas/shift-type.schema";
import { TimeSlot, TimeSlotSchema } from "./src/schemas/time-slots.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AttendanceRecord.name, schema: AttendanceRecordSchema },
      { name: ShiftAssignment.name, schema: ShiftAssignmentSchema },
      { name: ShiftType.name, schema: ShiftTypeSchema },
      { name: TimeSlot.name, schema: TimeSlotSchema },
    ]),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [],
})
export class AttendanceModule {}
