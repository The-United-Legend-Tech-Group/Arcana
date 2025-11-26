# Jest Testing — Time Management Subsystem

This document describes how Jest is used in this project, common patterns applied in tests (mocks, shapes, enums), how to run tests on Windows, how to verify generated tests, and how to debug common failures (especially those related to Mongoose decorators).

## Overview / Goals

- Keep unit tests fast and isolated from Mongoose decorators/schemas.
- Mock repository modules to avoid runtime schema loading.
- Ensure mocked data shapes match schemas (fields + defaults) and enums.
- Provide commands to run, debug and verify tests and coverage.

## Test file locations

- Main tests for the time subsystem live under:
  - backend/src/time-mangement/test/
- Test files use the `*.spec.ts` suffix (Jest default).

## Common patterns used in tests

1. Mock repository modules at the top of each test file to prevent loading Mongoose schema decorators:

```ts
jest.mock("../repository/shift.repository", () => ({
  ShiftRepository: jest.fn().mockImplementation(() => ({})),
}));

jest.mock("../repository/shift-assignment.repository", () => ({
  ShiftAssignmentRepository: jest.fn().mockImplementation(() => ({})),
}));

jest.mock("../repository/schedule-rule.repository", () => ({
  ScheduleRuleRepository: jest.fn().mockImplementation(() => ({})),
}));
```

2. Create realistic mock implementations in `beforeEach` so returned objects match schema fields and defaults. Example for `ScheduleRule` (schema requires `name`, `pattern`, `active`):

```ts
mockScheduleRuleRepo = {
  create: jest
    .fn()
    .mockImplementation((dto) =>
      Promise.resolve({ _id: "rule1", active: dto?.active ?? true, ...dto })
    ),
  find: jest.fn().mockResolvedValue([]),
};
```

3. Use enums from `models/enums/index.ts` when asserting statuses:

```ts
import { ShiftAssignmentStatus } from "../models/enums/index";

// in test
expect(result.status).toBe(ShiftAssignmentStatus.APPROVED);
```

4. Construct service with the mocked repos:

```ts
service = new TimeService(
  mockShiftRepo,
  mockShiftAssignmentRepo,
  mockScheduleRuleRepo
);
```

Note: Some tests may construct TimeService with only two mocks; service supports that pattern (third repo optional) to remain backward compatible.

## Why mocks are required

- Mongoose `@Prop()` / `@Schema()` decorators execute at import time and require runtime types. Importing schema-containing modules in unit tests can raise errors like:
  ```
  Cannot determine a type for the "Shift.punchPolicy" field ...
  ```
- Mocking repository
