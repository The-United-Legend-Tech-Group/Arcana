import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { forwardRef } from '@nestjs/common';
import { Asset, AssetSchema } from './Schema/Asset.schema';
import { OnboardingTaskInstance, OnboardingTaskInstanceSchema } from './Schema/OnboardingTaskInstance.schema';
import { Document, DocumentSchema } from './Schema/DocumentSchema.schema';
import { EmployeeTracker, EmployeeTrackerSchema } from './Schema/EmployeeTracker.schema';
import { Contract, ContractSchema } from './Schema/ContractDocument.schema';



@Module({
  imports: [
    MongooseModule.forFeature([{ name: Asset.name, schema: AssetSchema },{ name: OnboardingTaskInstance.name, schema: OnboardingTaskInstanceSchema },{ name: Document.name, schema: DocumentSchema },{ name: EmployeeTracker.name, schema: EmployeeTrackerSchema },{ name: Contract.name, schema: ContractSchema }]),
    ],
  controllers: [],
  providers: [],
})
export class OnBoardingModule {}
