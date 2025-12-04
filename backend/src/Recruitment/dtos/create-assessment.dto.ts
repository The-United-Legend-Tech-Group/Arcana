import { IsNotEmpty, IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAssessmentDto {
    @ApiProperty({
        description: 'ID of the interview this assessment is for',
        example: '507f1f77bcf86cd799439011',
    })
    @IsNotEmpty()
    @IsString()
    interviewId: string;

    @ApiProperty({
        description: 'ID of the interviewer providing the assessment',
        example: '507f1f77bcf86cd799439012',
    })
    @IsNotEmpty()
    @IsString()
    interviewerId: string;

    @ApiProperty({
        description: 'Assessment score for the candidate (1-10)',
        example: 8.5,
        minimum: 1,
        maximum: 10,
    })
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Max(10)
    score: number;

    @ApiProperty({
        description: 'Comments and feedback from the interviewer',
        example: 'Candidate showed excellent technical skills and communication abilities. Recommended for next round.',
        required: false,
    })
    @IsOptional()
    @IsString()
    comments?: string;
}