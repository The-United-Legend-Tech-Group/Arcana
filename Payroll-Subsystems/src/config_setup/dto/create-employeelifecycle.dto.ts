import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  EmployeeCondition,
  PayrollStatus,
} from '../schemas/adaptedEmployees.schema';

export class CreateEmployeeLifecycleDto {
  @IsNotEmpty()
  @IsString()
  contractId: string;

  @IsOptional()
  @IsEnum(EmployeeCondition)
  condition?: EmployeeCondition;

  @IsOptional()
  @IsEnum(PayrollStatus)
  status?: PayrollStatus;

  @IsOptional()
  @IsBoolean()
  processed?: boolean;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  processedAt?: Date;
}
