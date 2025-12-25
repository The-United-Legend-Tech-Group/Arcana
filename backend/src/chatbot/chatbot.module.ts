import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';

// Import chatbot-specific services
import { ConversationService } from './services/conversation.service';
import { ToolExecutorService } from './services/tool-executor.service';

// Import conversation schema for message storage
import { Conversation, ConversationSchema } from './models/conversation.schema';

// Import modules that EXPORT their services
// Check each module's exports to ensure services are available
import { EmployeeModule } from '../employee-profile/employee-profile.module';                    // exports: EmployeeService
import { OrganizationStructureModule } from '../organization-structure/organization-structure.module'; // exports: OrganizationStructureService
import { NotificationModule } from '../notification/notification.module';                        // exports: NotificationService
import { ConfigSetupModule } from '../payroll-configuration/payroll-configuration.module';      // exports: ConfigSetupService

// Import auth guard
import { AuthGuard } from '../common/guards/authentication.guard';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        // Conversation storage schema
        MongooseModule.forFeature([
            { name: Conversation.name, schema: ConversationSchema },
        ]),
        // JWT for authentication
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
                signOptions: { expiresIn: '15m' },
            }),
            inject: [ConfigService],
        }),
        // Import modules with services we need
        // Using forwardRef to handle potential circular dependencies
        forwardRef(() => EmployeeModule),
        forwardRef(() => OrganizationStructureModule),
        forwardRef(() => NotificationModule),
        forwardRef(() => ConfigSetupModule),
    ],
    controllers: [ChatbotController],
    providers: [
        ChatbotService,
        ConversationService,
        ToolExecutorService,
        AuthGuard,
    ],
    exports: [ChatbotService],
})
export class ChatbotModule { }
