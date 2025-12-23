import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class GenerateRefundDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'Amount must be a positive number' })
  amount?: number;
}

