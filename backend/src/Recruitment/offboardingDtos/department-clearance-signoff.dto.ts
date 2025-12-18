import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApprovalStatus } from '../enums/approval-status.enum';
export class DepartmentClearanceSignOffDto {
  @IsMongoId({
    message: 'Clearance checklist ID must be a valid MongoDB ObjectId',
  })
  @IsNotEmpty({ message: 'Clearance checklist ID is required' })
  clearanceChecklistId: string;
  @IsString({ message: 'Department name must be a string' })
  @IsNotEmpty({ message: 'Department name is required' })
  department: string;
  @IsEnum(ApprovalStatus, {
    message: 'Status must be one of: approved, rejected, pending, or in_progress',
  })
  @IsNotEmpty({ message: 'Approval status is required' })
  status: ApprovalStatus;
  @IsOptional()
  @IsMongoId({ message: 'Approver ID must be a valid MongoDB ObjectId' })
  approverId?: string;
  @IsOptional()
  @IsString({ message: 'Comments must be a string' })
  comments?: string;
}
