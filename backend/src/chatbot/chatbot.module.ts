import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';

// Import schemas
import { EmployeeProfile, EmployeeProfileSchema } from '../employee-profile/models/employee-profile.schema';
import { payrollPolicies, payrollPoliciesSchema } from '../payroll-configuration/models/payrollPolicies.schema';
import { Department, DepartmentSchema } from '../organization-structure/models/department.schema';
import { Position, PositionSchema } from '../organization-structure/models/position.schema';
import { LeaveRequest, LeaveRequestSchema } from '../leaves/models/leave-request.schema';

// Import auth guard
import { AuthGuard } from '../common/guards/authentication.guard';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: EmployeeProfile.name, schema: EmployeeProfileSchema },
            { name: payrollPolicies.name, schema: payrollPoliciesSchema },
            { name: Department.name, schema: DepartmentSchema },
            { name: Position.name, schema: PositionSchema },
            { name: LeaveRequest.name, schema: LeaveRequestSchema },
        ]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
                signOptions: { expiresIn: '15m' },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [ChatbotController],
    providers: [ChatbotService, AuthGuard],
    exports: [ChatbotService],
})
export class ChatbotModule { }
