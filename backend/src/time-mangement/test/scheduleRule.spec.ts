// Prevent repository modules from importing Mongoose schemas (and therefore enums/models)
// so tests can instantiate the service with mocked repositories without loading decorators.
jest.mock('../repository/schedule-rule.repository', () => ({
  ScheduleRuleRepository: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('../repository/shift-assignment.repository', () => ({
  ShiftAssignmentRepository: jest.fn().mockImplementation(() => ({})),
}));

// Also mock shift repository to avoid importing Mongoose schemas during tests
jest.mock('../repository/shift.repository', () => ({
  ShiftRepository: jest.fn().mockImplementation(() => ({})),
}));

import { TimeService } from '../time.service';

describe('TimeService - ScheduleRule flows', () => {
  let mockScheduleRuleRepo: any;
  let mockShiftAssignmentRepo: any;
  let mockShiftRepo: any;
  let service: TimeService;

  beforeEach(() => {
    mockScheduleRuleRepo = {
      create: jest.fn().mockImplementation((dto) =>
        Promise.resolve({
          _id: 'rule1',
          active: dto?.active ?? true,
          ...dto,
        }),
      ),
      find: jest.fn().mockResolvedValue([]),
    };

    mockShiftAssignmentRepo = {
      updateById: jest
        .fn()
        .mockImplementation((id, update) =>
          Promise.resolve({ _id: id, ...update }),
        ),
    };

    mockShiftRepo = { find: jest.fn().mockResolvedValue([]) };

    service = new TimeService(
      mockShiftRepo,
      mockShiftAssignmentRepo,
      mockScheduleRuleRepo,
    );
  });

  it('creates a schedule rule via repository', async () => {
    const dto = {
      name: '4on3off',
      pattern: '4on-3off',
      shiftTypes: ['Normal', 'Rotational'],
      startDate: '2025-11-01',
      endDate: '2025-11-30',
    } as any;

    const res = await service.createScheduleRule(dto);

    // service should have encoded structured fields into the pattern string
    expect(mockScheduleRuleRepo.create).toHaveBeenCalled();
    const calledArg = mockScheduleRuleRepo.create.mock.calls[0][0];
    expect(calledArg).toHaveProperty('name', '4on3off');
    expect(typeof calledArg.pattern).toBe('string');
    // parsed pattern should contain the structured rule
    const parsed = JSON.parse(calledArg.pattern);
    expect(parsed.shiftTypes).toEqual(['Normal', 'Rotational']);
    expect(parsed.startDate).toBe('2025-11-01');
    expect(parsed.endDate).toBe('2025-11-30');
    expect(res).toHaveProperty('_id', 'rule1');
  });

  it('lists schedule rules', async () => {
    mockScheduleRuleRepo.find.mockResolvedValueOnce([
      { _id: 'rule1', name: 'r1', pattern: 'p', active: true },
    ]);

    const results = await service.getScheduleRules();
    expect(mockScheduleRuleRepo.find).toHaveBeenCalled();
    expect(results).toHaveLength(1);
    expect(results[0]).toHaveProperty('name', 'r1');
  });

  it('attaches a schedule rule to an assignment', async () => {
    const res = await service.attachScheduleRuleToAssignment(
      'assign1',
      'rule1',
    );

    expect(mockShiftAssignmentRepo.updateById).toHaveBeenCalledWith('assign1', {
      scheduleRuleId: 'rule1',
    });
    expect(res).toHaveProperty('_id', 'assign1');
    expect(res).toHaveProperty('scheduleRuleId', 'rule1');
  });
});
