import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsEmail } from 'class-validator';

export class HrSignContractDto {
  @IsNotEmpty()
  @IsString()
  contractId: string;

  @IsOptional()
  @IsString()
  hrEmployeeId?: string;

  @IsOptional()
  @IsString()
  signedAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  useCustomEmployeeData?: boolean;

  // Custom employee data fields (only used if useCustomEmployeeData is true)
  @IsOptional()
  @IsString()
  customFirstName?: string;

  @IsOptional()
  @IsString()
  customLastName?: string;

  @IsOptional()
  @IsString()
  customNationalId?: string;

  @IsOptional()
  @IsString()
  customEmployeeNumber?: string;

  @IsOptional()
  @IsEmail()
  customWorkEmail?: string;

  @IsOptional()
  @IsString()
  customStatus?: string;

  @IsOptional()
  @IsString()
  customContractType?: string;

  @IsOptional()
  @IsString()
  customWorkType?: string;
}
