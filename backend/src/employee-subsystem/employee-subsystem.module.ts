import { Module } from '@nestjs/common';
import { AppController } from './employee-subsystem.controller';
import { AppService } from './employee-subsystem.service';
import { EmployeeModule } from './employee/employee.module';
import { OrganizationStructureModule } from './organization-structure/organization-structure.module';
import { NotificationModule } from './notification/notification.module';
import { AuthModule } from './employee/auth.module';

@Module({
  imports: [
    EmployeeModule,
    OrganizationStructureModule,
    NotificationModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class EmployeeSubsystemModule {}
