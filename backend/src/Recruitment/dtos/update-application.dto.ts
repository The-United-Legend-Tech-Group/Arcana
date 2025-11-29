import { IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStage } from '../enums/application-stage.enum';
import { ApplicationStatus } from '../enums/application-status.enum';

export class UpdateApplicationDto {
  @ApiPropertyOptional({
    description: 'Update application stage. When changing to hr_interview or department_interview, include interviewData to automatically schedule interview.',
    enum: ApplicationStage,
    example: ApplicationStage.DEPARTMENT_INTERVIEW,
    enumName: 'ApplicationStage'
  })
  @IsOptional()
  @IsEnum(ApplicationStage)
  currentStage?: ApplicationStage;

  @ApiPropertyOptional({
    description: 'Update application status. Status reflects the current state of the application process.',
    enum: ApplicationStatus,
    example: ApplicationStatus.IN_PROCESS,
    enumName: 'ApplicationStatus'
  })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiProperty({
    description: 'HR ID of the person updating the application',
    example: '507f1f77bcf86cd799439013',
    type: 'string'
  })
  @IsMongoId()
  hrId: string;

  @ApiPropertyOptional({
    description: 'Assign or reassign the application to a different HR representative by their user ID.',
    example: '507f1f77bcf86cd799439016',
  })
  @IsOptional()
  @IsMongoId()
  assignedHr?: string;
}