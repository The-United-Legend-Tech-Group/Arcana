import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Performance, PerformanceSchema } from './schema/performance.schema';
import { PerformanceCycle, PerformanceCycleSchema } from 'src/performance/schema/performanceCycle.schema';
import { PerformanceTemplate, PerformanceTemplateSchema } from 'src/performance/schema/performanceTemplate.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Performance.name, schema: PerformanceSchema },
      { name: PerformanceCycle.name, schema: PerformanceCycleSchema },
      { name: PerformanceTemplate.name, schema: PerformanceTemplateSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class PerformanceModule {}