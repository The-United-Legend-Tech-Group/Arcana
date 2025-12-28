import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePayGradeDto {
  @ApiProperty({
    description: 'Pay grade name',
    example: 'Junior TA',
  })
  @IsNotEmpty()
  @IsString()
  grade: string;

  @ApiProperty({
    description: 'Base salary',
    example: 8000,
    minimum: 6000,
  })
  @IsNumber()
  @Min(6000)
  baseSalary: number;

  // Status will be set to DRAFT by default in schema
  // createdBy will be set from authenticated user
  // grossSalary is calculated automatically as baseSalary + sum of approved allowances
}
