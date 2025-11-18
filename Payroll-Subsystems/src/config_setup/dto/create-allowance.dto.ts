import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { AllowanceStatus, AllowanceType } from '../schemas/allowance.schema';

export class CreateAllowanceDto {
  @IsNotEmpty()
  @IsEnum(AllowanceType)
  type: AllowanceType;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsEnum(AllowanceStatus)
  status?: AllowanceStatus;
}
