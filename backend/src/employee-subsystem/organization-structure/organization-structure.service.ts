import { Injectable, NotFoundException } from '@nestjs/common';
import { PositionRepository } from './repository/position.repository';
import { Position } from './models/position.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {StructureChangeRequest,StructureChangeRequestDocument,} from './models/structure-change-request.schema';
import { StructureRequestStatus } from './enums/organization-structure.enums';

@Injectable()
export class OrganizationStructureService {
    constructor(
        private readonly positionRepository: PositionRepository,
        @InjectModel(StructureChangeRequest.name)
        private readonly changeRequestModel: Model<StructureChangeRequestDocument>,
    ) { }

    async getOpenPositions(): Promise<Position[]> {
        return this.positionRepository.find({ isActive: false });
    }

    async listPendingChangeRequests(): Promise<StructureChangeRequest[]> {
        return this.changeRequestModel
            .find({ status: { $in: [StructureRequestStatus.SUBMITTED, StructureRequestStatus.UNDER_REVIEW] } })
            .sort({ createdAt: -1 })
            .exec();
    }

    async getChangeRequestById(id: string): Promise<StructureChangeRequest> {
        const req = await this.changeRequestModel.findById(id).exec();
        if (!req) throw new NotFoundException('Change request not found');
        return req;
    }

    async approveChangeRequest(id: string, comment?: string): Promise<StructureChangeRequest> {
        const updated = await this.changeRequestModel
            .findByIdAndUpdate(
                id,
                { status: StructureRequestStatus.APPROVED },
                { new: true },
            )
            .exec();
        if (!updated) throw new NotFoundException('Change request not found');
        return updated;
    }

    async rejectChangeRequest(id: string, comment?: string): Promise<StructureChangeRequest> {
        const updated = await this.changeRequestModel
            .findByIdAndUpdate(
                id,
                { status: StructureRequestStatus.REJECTED },
                { new: true },
            )
            .exec();
        if (!updated) throw new NotFoundException('Change request not found');
        return updated;
    }
}
