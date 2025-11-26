import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AppraisalRecord,
  AppraisalRecordSchema,
} from './models/appraisal-record.schema';
import {
  AppraisalCycle,
  AppraisalCycleSchema,
} from './models/appraisal-cycle.schema';
import {
  AppraisalTemplate,
  AppraisalTemplateSchema,
} from './models/appraisal-template.schema';
import {
  AppraisalAssignment,
  AppraisalAssignmentSchema,
} from './models/appraisal-assignment.schema';
import { AppraisalCycleRepository } from './repository/appraisal-cycle.repository';
import { AppraisalCycleService } from './appraisal-cycle.service';
import { AppraisalCycleController } from './appraisal-cycle.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AppraisalRecord.name, schema: AppraisalRecordSchema },
      { name: AppraisalCycle.name, schema: AppraisalCycleSchema },
      { name: AppraisalTemplate.name, schema: AppraisalTemplateSchema },
      { name: AppraisalAssignment.name, schema: AppraisalAssignmentSchema },
    ]),
  ],
  controllers: [AppraisalCycleController],
  providers: [AppraisalCycleRepository, AppraisalCycleService],
  exports: [MongooseModule],
})
export class PerformanceModule { }
