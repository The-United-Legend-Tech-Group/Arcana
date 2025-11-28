import { OrganizationStructureService } from '../organization-structure.service';

describe('OrganizationStructureService notifications', () => {
  let service: OrganizationStructureService;

  const mockPositionRepository: any = {
    findById: jest.fn(),
  };

  const mockDepartmentRepository: any = {
    findById: jest.fn(),
  };

  const mockEmployeeModel: any = {
    find: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      }),
    }),
  };

  const mockPositionAssignmentModel: any = {};

  const mockNotificationService: any = {
    create: jest.fn().mockResolvedValue(true),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // stubbed Mongoose model used for change requests; when called with `new` it returns an object with save()
    const changeRequestModel: any = function (this: any, payload: any) {
      Object.assign(this, payload);
      this._id = 'req-1';
      this.requestNumber = payload.requestNumber || 'SCR-123';
    } as any;

    // Mock save method on prototype to return the saved document
    changeRequestModel.prototype.save = jest.fn(async function (this: any) {
      return { ...this, _id: this._id || 'req-1', requestNumber: this.requestNumber };
    });

    // Mock findByIdAndUpdate to return an object with exec()
    changeRequestModel.findByIdAndUpdate = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    // Mock structure approval model
    const mockStructureApprovalModel: any = {
      create: jest.fn(),
    };

    service = new OrganizationStructureService(
      mockPositionRepository,
      mockDepartmentRepository,
      changeRequestModel as any,
      mockStructureApprovalModel,
      mockEmployeeModel as any,
      mockPositionAssignmentModel as any,
      mockNotificationService,
    );
  });

  it('should call NotificationService.create when submitting a change request', async () => {
    // arrange: position has a supervisor position id, and that position has an employee
    mockPositionRepository.findById.mockResolvedValue({
      _id: 'pos-1',
      reportsToPositionId: { toString: () => 'pos-sup-1' }
    });

    // Mock the chained query methods for employeeModel
    mockEmployeeModel.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([{ _id: { toString: () => 'mgr-1' } }]),
        }),
      }),
    });

    const dto = {
      requestedByEmployeeId: 'emp-1',
      targetPositionId: 'pos-1',
      details: 'Change details',
      requestType: 'NEW_POSITION'
    } as any;

    // act
    const saved = await service.submitChangeRequest(dto);

    // assert: notificationService.create invoked with recipients containing mgr-1
    expect(mockNotificationService.create).toHaveBeenCalled();
    const arg = mockNotificationService.create.mock.calls[0][0];
    expect(arg.recipientId).toContain('mgr-1');
    expect(arg.relatedModule).toBe('OrganizationStructure');
    expect(saved).toHaveProperty('requestNumber');
  });

  it('should call NotificationService.create when approving a change request', async () => {
    // arrange: change request update returns object with targetDepartmentId
    const updated = {
      _id: 'req-2',
      requestNumber: 'SCR-456',
      targetDepartmentId: { toString: () => 'dep-1' }
    } as any;

    const changeRequestModel: any = (service as any).changeRequestModel;
    changeRequestModel.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(updated),
    });

    // department returns head position id and employeeModel returns head
    mockDepartmentRepository.findById.mockResolvedValue({
      _id: 'dep-1',
      headPositionId: { toString: () => 'pos-head-1' }
    });

    // Mock the chained query methods for employeeModel
    mockEmployeeModel.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([{ _id: { toString: () => 'head-1' } }]),
        }),
      }),
    });

    const res = await service.approveChangeRequest('req-2', 'OK');

    expect(res).toBe(updated);
    expect(mockNotificationService.create).toHaveBeenCalled();
    const arg = mockNotificationService.create.mock.calls[0][0];
    expect(arg.recipientId).toContain('head-1');
    expect(arg.title).toContain('Approved');
  });
});
