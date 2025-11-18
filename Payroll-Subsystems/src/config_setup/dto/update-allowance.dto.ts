import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { AllowanceStatus, AllowanceType } from '../schemas/allowance.schema';

export class UpdateAllowanceDto {
  @IsOptional()
  @IsEnum(AllowanceType)
  type?: AllowanceType;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsEnum(AllowanceStatus)
  status?: AllowanceStatus;
}
