import { Injectable } from '@nestjs/common';
import { Notification } from './models/notification.schema';
import { NotificationRepository } from './repository/notification.repository';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) { }

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const payload: Partial<Notification> = {
      ...createNotificationDto,
      recipientId: createNotificationDto.recipientId.map(
        (id) => new Types.ObjectId(id),
      ),
      readBy: [],
    };
    return this.notificationRepository.create(payload);
  }

  async findByRecipientId(recipientId: string) {
    const notifications = await this.notificationRepository.find({
      $or: [{ recipientId: recipientId }, { deliveryType: 'BROADCAST' }],
    });

    return notifications.map(n => {
      const obj = n.toObject ? n.toObject() : n;
      return {
        ...obj,
        isRead: n.readBy.some(id => id.toString() === recipientId.toString())
      };
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.notificationRepository.updateById(notificationId, {
      $addToSet: { readBy: new Types.ObjectId(userId) }
    });
  }

  async markAllAsRead(userId: string) {
    return this.notificationRepository.updateMany(
      {
        $or: [{ recipientId: userId }, { deliveryType: 'BROADCAST' }]
      },
      {
        $addToSet: { readBy: new Types.ObjectId(userId) }
      }
    );
  }
}
