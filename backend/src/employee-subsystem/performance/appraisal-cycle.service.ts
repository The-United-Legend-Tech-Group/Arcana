import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAppraisalCycleDto } from './dto/create-appraisal-cycle.dto';
import { UpdateAppraisalCycleDto } from './dto/update-appraisal-cycle.dto';
import { AppraisalCycleRepository } from './repository/appraisal-cycle.repository';
import { AppraisalCycle } from './models/appraisal-cycle.schema';

@Injectable()
export class AppraisalCycleService {
    constructor(
        private readonly appraisalCycleRepository: AppraisalCycleRepository,
    ) { }

    async create(
        createAppraisalCycleDto: CreateAppraisalCycleDto,
    ): Promise<AppraisalCycle> {
        return this.appraisalCycleRepository.create(createAppraisalCycleDto as any);
    }

    async findAll(): Promise<AppraisalCycle[]> {
        return this.appraisalCycleRepository.find();
    }

    async findOne(id: string): Promise<AppraisalCycle> {
        const cycle = await this.appraisalCycleRepository.findById(id);
        if (!cycle) {
            throw new NotFoundException(`Appraisal Cycle with ID ${id} not found`);
        }
        return cycle;
    }

    async update(
        id: string,
        updateAppraisalCycleDto: UpdateAppraisalCycleDto,
    ): Promise<AppraisalCycle> {
        const updatedCycle = await this.appraisalCycleRepository.updateById(
            id,
            updateAppraisalCycleDto,
        );
        if (!updatedCycle) {
            throw new NotFoundException(`Appraisal Cycle with ID ${id} not found`);
        }
        return updatedCycle;
    }

    async remove(id: string): Promise<void> {
        const result = await this.appraisalCycleRepository.deleteById(id);
        if (!result) {
            throw new NotFoundException(`Appraisal Cycle with ID ${id} not found`);
        }
    }
}
