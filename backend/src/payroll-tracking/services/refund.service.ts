import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { refunds, refundsDocument } from '../models/refunds.schema';
import { disputes, disputesDocument } from '../models/disputes.schema';
import { DisputeStatus, RefundStatus } from '../enums/payroll-tracking-enum';
import { GenerateRefundDto } from '../dto/generate-refund.dto';

@Injectable()
export class RefundService {
  constructor(
    @InjectModel(refunds.name) private refundsModel: Model<refundsDocument>,
    @InjectModel(disputes.name) private disputesModel: Model<disputesDocument>,
  ) {}

  private async createRefundInstance(refundData: {
    disputeId?: Types.ObjectId;
    claimId?: Types.ObjectId;
    employeeId: Types.ObjectId;
    financeStaffId?: Types.ObjectId;
    refundDetails: {
      description: string;
      amount: number;
    };
    status: RefundStatus;
  }): Promise<refundsDocument> {
    return await this.refundsModel.create(refundData);
  }

  async generateRefundForDispute(
    disputeId: string,
    employeeId: Types.ObjectId,
    generateRefundDto: GenerateRefundDto,
  ): Promise<refundsDocument> {
    const cleanDisputeId = disputeId.trim();
    const dispute = await this.disputesModel.findOne({
      disputeId: cleanDisputeId,
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    if (dispute.status !== DisputeStatus.APPROVED) {
      throw new BadRequestException('Refund can only be generated for approved disputes');
    }

    if (!dispute.financeStaffId) {
      const anyRefund = await this.refundsModel.findOne({
        disputeId: dispute._id,
      });
      if (anyRefund?.financeStaffId) {
        dispute.financeStaffId = anyRefund.financeStaffId;
        await dispute.save();
      }
    }

    const existingRefund = await this.refundsModel.findOne({
      disputeId: dispute._id,
      status: RefundStatus.PENDING,
    });

    if (existingRefund) {
      throw new BadRequestException('A pending refund already exists for this dispute. The finance staff ID can be found in the refund record.');
    }

    // Extract refund amount from resolution comment
    let refundAmount: number | null = null;
    
    if (dispute.resolutionComment) {
      // Try to extract final refund amount first (set by manager)
      const finalMatch = dispute.resolutionComment.match(/Final refund amount: ([\d.]+)/);
      if (finalMatch && finalMatch[1]) {
        refundAmount = parseFloat(finalMatch[1]);
      } else {
        // Fall back to proposed amount (set by specialist)
        const proposedMatch = dispute.resolutionComment.match(/Proposed refund amount: ([\d.]+)/);
        if (proposedMatch && proposedMatch[1]) {
          refundAmount = parseFloat(proposedMatch[1]);
        }
      }
    }

    // Allow finance staff to override with generateRefundDto amount if needed
    if (generateRefundDto.amount !== undefined && generateRefundDto.amount !== null) {
      if (generateRefundDto.amount < 0) {
        throw new BadRequestException('Refund amount cannot be negative');
      }
      refundAmount = generateRefundDto.amount;
    }

    if (refundAmount === null || refundAmount === undefined || refundAmount <= 0) {
      throw new BadRequestException(
        'No valid refund amount found. The Payroll Manager must set the refund amount when confirming the dispute. ' +
        'You can also provide an amount in the refund generation request.'
      );
    }

    dispute.financeStaffId = employeeId;
    await dispute.save();

    return await this.createRefundInstance({
      disputeId: dispute._id,
      employeeId: dispute.employeeId,
      financeStaffId: employeeId,
      refundDetails: {
        description: generateRefundDto.description || `Refund for approved dispute ${dispute.disputeId}`,
        amount: refundAmount,
      },
      status: RefundStatus.PENDING,
    });
  }
}

