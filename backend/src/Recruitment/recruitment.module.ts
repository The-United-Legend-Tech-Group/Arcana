import { Module } from '@nestjs/common';
import { AppController } from './recruitment.controller';
import { recruitmentService } from './recruitment.service';

import { RecruitmentModule } from './Recruitment/rec.module';
import { OnBoardingModule } from './OnBoarding/OnBoarding.module';
import { OffBoardingModule } from './OffBoarding/OffBoarding.module';

@Module({
  imports: [
    RecruitmentModule,
    OnBoardingModule,
    OffBoardingModule,
  ],
  controllers: [AppController],
  providers: [recruitmentService],
})
export class recruitmentModule {}