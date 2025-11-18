import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { OffboardingTask, OffboardingTaskSchema } from './schema/OffBoarding/OffBoardingTask.schema';
import { OffboardingTracker, OffboardingTrackerSchema } from './schema/OffBoarding/OffBoardingTracker.schema';
import { TerminationRequest, TerminationRequestSchema } from './schema/OffBoarding/TerminationRequest.schema';
import { ResignationRequest, ResignationRequestSchema } from './schema/OffBoarding/ResignationRequest.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OffboardingTask.name, schema: OffboardingTaskSchema },
      { name: OffboardingTracker.name, schema: OffboardingTrackerSchema },
      { name: TerminationRequest.name, schema: TerminationRequestSchema },
      { name: ResignationRequest.name, schema: ResignationRequestSchema },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}