import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ChatbotService } from './chatbot.service';
import { ChatMessageDto, ChatResponseDto } from './chatbot.dto';
import { AuthGuard } from '../common/guards/authentication.guard';


interface JwtPayload {
    sub: string;
    employeeId?: string;
    roles?: string[];
    firstName?: string;
    lastName?: string;
}

@ApiTags('Chatbot')
@Controller('chatbot')
export class ChatbotController {
    constructor(private readonly chatbotService: ChatbotService) { }

    @Post('message')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Send a message to the AI chatbot' })
    @ApiResponse({ status: 200, description: 'Chat response', type: ChatResponseDto })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async sendMessage(
        @Body() dto: ChatMessageDto,
        @Request() req: { user: JwtPayload }
    ): Promise<ChatResponseDto> {
        const userContext = {
            employeeId: req.user.employeeId || req.user.sub,
            roles: req.user.roles || [],
            name: req.user.firstName ? `${req.user.firstName} ${req.user.lastName || ''}`.trim() : undefined,
        };

        const response = await this.chatbotService.processMessage(dto.message, userContext);

        return {
            response,
            timestamp: new Date(),
        };
    }
}
