import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LeaveEntitlement } from './models/leave-entitlement.schema';

@Injectable()
export class LeavesService {
  constructor(
    @InjectModel(LeaveEntitlement.name)
    private leaveEntitlementModel: Model<LeaveEntitlement>,
  ) {}

  async getLeaveEntitlementsByEmployeeId(employeeId: string) {
    return this.leaveEntitlementModel
      .find({ employeeId })
      .populate('leaveTypeId')
      .exec();
  }
}

