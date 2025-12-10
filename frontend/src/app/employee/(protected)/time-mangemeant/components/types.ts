export type SectionDefinition = {
  id: string;
  title: string;
  description: string;
};

export interface ShiftDefinition {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  punchPolicy?: string;
  graceInMinutes?: number;
  graceOutMinutes?: number;
  requiresApprovalForOvertime?: boolean;
  active?: boolean;
}

export interface ShiftAssignment {
  _id: string;
  employeeId?: string;
  departmentId?: string;
  positionId?: string;
  shiftId: string;
  scheduleRuleId?: string;
  startDate: string;
  endDate?: string;
  status: string;
}

export interface ScheduleRule {
  _id: string;
  name: string;
  active?: boolean;
  pattern?: string;
  shiftTypes?: string[];
  startDate?: string;
  endDate?: string;
}

export interface HolidayDefinition {
  _id: string;
  name?: string;
  startDate?: string;
  endDate?: string;
  weeklyDays?: string[];
  type?: string;
  description?: string;
}

export interface CorrectionRequest {
  _id: string;
  employeeId?: string;
  lineManagerId?: string;
  status: string;
  decision?: string;
  durationMinutes?: number;
  correctionType?: string;
  appliesFromDate?: string;
  submittedAt?: string;
  rejectionReason?: string;
  reason?: string;
  appliedToPayroll?: boolean;
  approvalFlow?: Array<{
    role?: string;
    status?: string;
    decidedBy?: string;
    decidedAt?: string;
  }>;
}
