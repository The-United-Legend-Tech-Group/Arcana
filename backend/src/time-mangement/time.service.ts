import { Injectable } from '@nestjs/common';
import { CreateTimeDto } from './dto/create-time.dto';
import { CreateShiftDto } from './dto/create-shift.dto';
import { AssignShiftDto } from './dto/assign-shift.dto';
import { UpdateShiftStatusDto } from './dto/update-shift-status.dto';
import { ShiftRepository } from './repository/shift.repository';
import { ShiftAssignmentRepository } from './repository/shift-assignment.repository';

@Injectable()
export class TimeService {
  constructor(
    private readonly shiftRepo: ShiftRepository,
    private readonly shiftAssignmentRepo: ShiftAssignmentRepository,
  ) {}

  /* Existing simple time record creation kept for backwards compatibility */
  private items: any[] = [];

  

  // Shifts API
  async createShift(dto: CreateShiftDto) {
    return this.shiftRepo.create(dto as any);
  }

  async assignShiftToEmployee(dto: AssignShiftDto) {
    const payload = {
      employeeId: dto.employeeId,
      shiftId: dto.shiftId,
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      status: dto.status,
    } as any;

    return this.shiftAssignmentRepo.create(payload);
  }

  async updateShiftAssignmentStatus(id: string, dto: UpdateShiftStatusDto) {
    return this.shiftAssignmentRepo.updateById(id, { status: dto.status });
  }

  async getShiftsForEmployeeTerm(employeeId: string, start: string, end: string) {
    const s = new Date(start);
    const e = new Date(end);

    return this.shiftAssignmentRepo.find({
      employeeId,
      startDate: { $lte: e },
      $or: [{ endDate: null }, { endDate: { $gte: s } }],
    } as any);
  }

  
}
