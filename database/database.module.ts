import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import {
  AttendanceRecord,
  AttendanceRecordSchema,
} from '../time-mangment-subsystem/attendance/src/schemas/attendance-record.schema';
import {
  ShiftAssignment,
  ShiftAssignmentSchema,
} from '../time-mangment-subsystem/attendance/src/schemas/shift-assignment.schema';
import {
  ShiftType,
  ShiftTypeSchema,
} from '../time-mangment-subsystem/attendance/src/schemas/shift-type.schema';
import {
  TimeSlot,
  TimeSlotSchema,
} from '../time-mangment-subsystem/attendance/src/schemas/time-slots.schema';

@Global()
@Module({
  imports: [
    ConfigModule,
    // Centralized connection — app-wide
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        // Prefer a full connection string if provided (supports both names)
        const fullUri = config.get<string>('MONGODB_URI') || config.get<string>('MONGO_URI');
        if (fullUri) return { uri: fullUri };

        // Otherwise build from components
        const user = encodeURIComponent(config.get<string>('MONGO_USER') || '');
        const pass = encodeURIComponent(config.get<string>('MONGO_PASS') || '');
        const host = config.get<string>('MONGO_HOST') || '';
        const db = config.get<string>('MONGO_DB') || 'test';
        const options = config.get<string>('MONGO_OPTIONS') || '?retryWrites=true&w=majority';
        const credentials = user || pass ? `${user}:${pass}@` : '';
        return { uri: `mongodb+srv://${credentials}${host}/${db}${options}` };
      },
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
