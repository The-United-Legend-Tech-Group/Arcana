import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true })
export class ChatMessage {
    @Prop({ required: true, enum: ['user', 'assistant', 'system', 'tool'] })
    role: string;

    @Prop({ required: true })
    content: string;

    @Prop()
    toolCallId?: string;

    @Prop({ type: Date, default: Date.now })
    timestamp: Date;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

@Schema({ collection: 'conversations', timestamps: true })
export class Conversation {
    @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true, index: true })
    userId: Types.ObjectId;

    @Prop({ type: [ChatMessageSchema], default: [] })
    messages: ChatMessage[];

    @Prop({ default: '' })
    summary: string;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ type: Date })
    lastMessageAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

// Index for efficient queries
ConversationSchema.index({ userId: 1, isActive: 1 });
ConversationSchema.index({ lastMessageAt: -1 });
