import { Test, TestingModule } from '@nestjs/testing';
import { AppraisalCycleService } from '../appraisal-cycle.service';
import { AppraisalCycleRepository } from '../repository/appraisal-cycle.repository';
import { CreateAppraisalCycleDto } from '../dto/create-appraisal-cycle.dto';
import { UpdateAppraisalCycleDto } from '../dto/update-appraisal-cycle.dto';
import { AppraisalTemplateType } from '../enums/performance.enums';
import { NotFoundException } from '@nestjs/common';

describe('AppraisalCycleService', () => {
    let service: AppraisalCycleService;
    let repository: AppraisalCycleRepository;

    const mockRepository = {
        create: jest.fn(),
        find: jest.fn(),
        findById: jest.fn(),
        updateById: jest.fn(),
        deleteById: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AppraisalCycleService,
                {
                    provide: AppraisalCycleRepository,
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<AppraisalCycleService>(AppraisalCycleService);
        repository = module.get<AppraisalCycleRepository>(AppraisalCycleRepository);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create an appraisal cycle', async () => {
            const dto: CreateAppraisalCycleDto = {
                name: 'Test Cycle',
                cycleType: AppraisalTemplateType.ANNUAL,
                startDate: new Date(),
                endDate: new Date(),
            };
            mockRepository.create.mockResolvedValue(dto);

            expect(await service.create(dto)).toEqual(dto);
            expect(mockRepository.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('findAll', () => {
        it('should return an array of appraisal cycles', async () => {
            const result = [{ name: 'Test Cycle' }];
            mockRepository.find.mockResolvedValue(result);

            expect(await service.findAll()).toEqual(result);
        });
    });

    describe('findOne', () => {
        it('should return a single appraisal cycle', async () => {
            const result = { name: 'Test Cycle' };
            mockRepository.findById.mockResolvedValue(result);

            expect(await service.findOne('someId')).toEqual(result);
        });

        it('should throw NotFoundException if not found', async () => {
            mockRepository.findById.mockResolvedValue(null);

            await expect(service.findOne('someId')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('update', () => {
        it('should update an appraisal cycle', async () => {
            const dto: UpdateAppraisalCycleDto = { name: 'Updated Name' };
            const result = { name: 'Updated Name' };
            mockRepository.updateById.mockResolvedValue(result);

            expect(await service.update('someId', dto)).toEqual(result);
        });

        it('should throw NotFoundException if not found', async () => {
            const dto: UpdateAppraisalCycleDto = { name: 'Updated Name' };
            mockRepository.updateById.mockResolvedValue(null);

            await expect(service.update('someId', dto)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('remove', () => {
        it('should remove an appraisal cycle', async () => {
            mockRepository.deleteById.mockResolvedValue({ deletedCount: 1 });

            await expect(service.remove('someId')).resolves.not.toThrow();
        });

        it('should throw NotFoundException if not found', async () => {
            mockRepository.deleteById.mockResolvedValue(null);

            await expect(service.remove('someId')).rejects.toThrow(NotFoundException);
        });
    });
});
