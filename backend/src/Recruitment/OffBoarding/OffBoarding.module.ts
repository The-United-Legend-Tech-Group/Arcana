import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OffboardingTask, OffboardingTaskSchema } from './Schema/OffBoardingTask.schema';
import { OffboardingTracker, OffboardingTrackerSchema } from './Schema/OffBoardingTracker.schema';
import { TerminationRequest, TerminationRequestSchema } from './Schema/TerminationRequest.schema';
import { ResignationRequest, ResignationRequestSchema } from './Schema/ResignationRequest.schema';


@Module({
    imports: [
        MongooseModule.forFeature([
            { name: OffboardingTask.name, schema: OffboardingTaskSchema },
            { name: OffboardingTracker.name, schema: OffboardingTrackerSchema },
            { name: TerminationRequest.name, schema: TerminationRequestSchema },
            { name: ResignationRequest.name, schema: ResignationRequestSchema },
        ]),
    ],
    controllers: [],
    providers: [],
    exports: [MongooseModule],
})
export class OffBoardingModule {}