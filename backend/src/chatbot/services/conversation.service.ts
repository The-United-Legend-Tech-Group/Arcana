import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation, ConversationDocument, ChatMessage } from '../models/conversation.schema';

@Injectable()
export class ConversationService {
    private readonly MAX_MESSAGES_IN_CONTEXT = 5;

    constructor(
        @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    ) { }

    /**
     * Get or create an active conversation for a user
     */
    async getOrCreateConversation(userId: string): Promise<ConversationDocument> {
        let conversation = await this.conversationModel.findOne({
            userId: new Types.ObjectId(userId),
            isActive: true,
        }).exec();

        if (!conversation) {
            conversation = await this.conversationModel.create({
                userId: new Types.ObjectId(userId),
                messages: [],
                summary: '',
                isActive: true,
                lastMessageAt: new Date(),
            });
        }

        return conversation;
    }

    /**
     * Add a message to the conversation
     */
    async addMessage(
        conversationId: string,
        role: 'user' | 'assistant' | 'system' | 'tool',
        content: string,
        toolCallId?: string,
    ): Promise<void> {
        const message: ChatMessage = {
            role,
            content,
            timestamp: new Date(),
            ...(toolCallId && { toolCallId }),
        };

        await this.conversationModel.findByIdAndUpdate(conversationId, {
            $push: { messages: message },
            $set: { lastMessageAt: new Date() },
        });
    }

    /**
     * Get recent messages for context (rolling window)
     */
    async getRecentMessages(
        conversationId: string,
        limit: number = this.MAX_MESSAGES_IN_CONTEXT,
    ): Promise<Array<{ role: string; content: string }>> {
        const conversation = await this.conversationModel.findById(conversationId).exec();

        if (!conversation) {
            return [];
        }

        // Get last N messages, excluding tool messages for context
        const relevantMessages = conversation.messages
            .filter(m => m.role !== 'tool' && m.role !== 'system')
            .slice(-limit);

        return relevantMessages.map(m => ({
            role: m.role,
            content: m.content,
        }));
    }

    /**
     * Get conversation summary
     */
    async getSummary(conversationId: string): Promise<string> {
        const conversation = await this.conversationModel.findById(conversationId).exec();
        return conversation?.summary || '';
    }

    /**
     * Update conversation summary
     */
    async updateSummary(conversationId: string, summary: string): Promise<void> {
        await this.conversationModel.findByIdAndUpdate(conversationId, {
            $set: { summary },
        });
    }

    /**
     * End/archive a conversation
     */
    async endConversation(conversationId: string): Promise<void> {
        await this.conversationModel.findByIdAndUpdate(conversationId, {
            $set: { isActive: false },
        });
    }

    /**
     * Clear old messages to prevent context overflow
     * Keeps summary + last N messages
     */
    async trimMessages(conversationId: string, keepLast: number = 10): Promise<void> {
        const conversation = await this.conversationModel.findById(conversationId).exec();

        if (!conversation || conversation.messages.length <= keepLast) {
            return;
        }

        const trimmedMessages = conversation.messages.slice(-keepLast);

        await this.conversationModel.findByIdAndUpdate(conversationId, {
            $set: { messages: trimmedMessages },
        });
    }
}
