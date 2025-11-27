import { Body, Controller, Post, Get, UseGuards, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { AuthGuard } from '../guards/authentication.guard';


@Controller('notification')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Post()
    @UseGuards(ApiKeyGuard)
    async create(@Body() createNotificationDto: CreateNotificationDto) {
        return this.notificationService.create(createNotificationDto);
    }

    @Get()
    @UseGuards(AuthGuard)
    async getNotifications(@Req() req) {
        return this.notificationService.findAllByEmployeeId(req.user.userid);
    }
}
