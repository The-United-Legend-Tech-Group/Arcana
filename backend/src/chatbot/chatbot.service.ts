import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { ConversationService } from './services/conversation.service';
import { ToolExecutorService } from './services/tool-executor.service';
import { getToolDefinitions } from './tools/tool-definitions';
import { buildSystemPrompt, ERROR_MESSAGES, UserContext } from './config/prompts';

@Injectable()
export class ChatbotService {
    private groq: Groq | null = null;
    private readonly modelName: string;
    private readonly MAX_TOOL_ITERATIONS = 5;

    constructor(
        private configService: ConfigService,
        private conversationService: ConversationService,
        private toolExecutor: ToolExecutorService,
    ) {
        // Configurable model name via environment variable
        this.modelName = this.configService.get<string>('GROQ_MODEL') || 'llama-3.3-70b-versatile';

        const apiKey = this.configService.get<string>('groq.apiKey') ||
            this.configService.get<string>('GROQ_API_KEY');
        if (apiKey) {
            this.groq = new Groq({ apiKey });
            console.log(`[ChatbotService] Groq AI initialized (model: ${this.modelName}, tools: ${getToolDefinitions().length})`);
        } else {
            console.error('[ChatbotService] ❌ No GROQ_API_KEY found');
        }
    }

    /**
     * Process a chat message with conversation context and tool calling
     */
    async processMessage(message: string, userContext: UserContext): Promise<string> {
        if (!this.groq) {
            return ERROR_MESSAGES.NO_API_KEY;
        }

        try {
            // Step 1: Get or create conversation
            const conversation = await this.conversationService.getOrCreateConversation(
                userContext.employeeId
            );

            // Step 2: Get recent messages for context
            const recentMessages = await this.conversationService.getRecentMessages(
                conversation._id.toString()
            );

            // Step 3: Build messages array for Groq
            const messages: any[] = [
                { role: 'system', content: buildSystemPrompt(userContext) },
                ...recentMessages.map(m => ({
                    role: m.role,
                    content: m.content,
                })),
                { role: 'user', content: message },
            ];

            // Step 4: Call LLM with tools
            let response = await this.callLLMWithTools(messages);
            let iterations = 0;

            console.log('[ChatbotService] Initial response:', {
                hasToolCalls: !!response.toolCalls,
                toolCallCount: response.toolCalls?.length || 0,
            });

            // Step 5: Handle tool calls in a loop
            while (response.toolCalls && response.toolCalls.length > 0 && iterations < this.MAX_TOOL_ITERATIONS) {
                iterations++;
                console.log(`[ChatbotService] Tool call iteration ${iterations}`);

                // Add assistant message WITH tool_calls attached (required by Groq)
                messages.push({
                    role: 'assistant',
                    content: response.content || null,
                    tool_calls: response.toolCalls.map(tc => ({
                        id: tc.id,
                        type: 'function',
                        function: {
                            name: tc.name,
                            arguments: JSON.stringify(tc.arguments),
                        },
                    })),
                });

                // Execute each tool and add results
                for (const toolCall of response.toolCalls) {
                    console.log(`[ChatbotService] Executing tool: ${toolCall.name}`, toolCall.arguments);

                    const result = await this.toolExecutor.executeTool(
                        toolCall.name,
                        toolCall.arguments,
                        userContext
                    );

                    console.log(`[ChatbotService] Tool result:`, result.success ? 'success' : result.error);

                    // Add tool result message
                    messages.push({
                        role: 'tool',
                        content: JSON.stringify(result),
                        tool_call_id: toolCall.id,
                    });
                }

                // Call LLM again with tool results
                response = await this.callLLMWithTools(messages);
            }

            const finalResponse = response.content || 'I apologize, but I could not generate a response.';

            // Step 6: Save to conversation history
            await this.conversationService.addMessage(
                conversation._id.toString(),
                'user',
                message
            );
            await this.conversationService.addMessage(
                conversation._id.toString(),
                'assistant',
                finalResponse
            );

            // Step 7: Trim old messages
            await this.conversationService.trimMessages(conversation._id.toString(), 20);

            return finalResponse;
        } catch (error: any) {
            console.error('[ChatbotService] ❌ Error:', error);

            // Handle specific Groq API errors with clear logging
            if (error?.error?.error?.code === 'tool_use_failed') {
                console.error('[ChatbotService] ⚠️ TOOL_USE_FAILED - Model generated malformed tool call');
                console.error('[ChatbotService] Failed generation:', error?.error?.error?.failed_generation);
                return `${ERROR_MESSAGES.TOOL_FAILED}\n\n(Error: tool_use_failed - the AI tried to call a function but the format was incorrect)`;
            }

            if (error?.status === 429) {
                console.error('[ChatbotService] ⚠️ RATE_LIMIT - Too many requests');
                return 'I\'m receiving too many requests right now. Please wait a moment and try again.';
            }

            if (error?.status === 503 || error?.status === 502) {
                return ERROR_MESSAGES.LLM_UNAVAILABLE;
            }

            // For any other error, log it and return user-friendly message
            return `${ERROR_MESSAGES.UNKNOWN_ERROR}\n\n(Error: ${error?.message || 'Unknown'})`;
        }
    }

    /**
     * Call LLM with tool definitions
     */
    private async callLLMWithTools(messages: any[]): Promise<{
        content: string | null;
        toolCalls: Array<{ id: string; name: string; arguments: any }> | null;
    }> {
        const tools = getToolDefinitions();

        const completion = await this.groq!.chat.completions.create({
            messages,
            model: this.modelName,
            tools: tools as any,
            tool_choice: 'auto',
            temperature: 0.7,
            max_tokens: 1000,
        });

        const choice = completion.choices[0];
        const assistantMessage = choice.message;

        // Check for tool calls
        if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
            console.log('[ChatbotService] LLM requested tool calls:',
                assistantMessage.tool_calls.map(tc => tc.function.name));

            return {
                content: assistantMessage.content,
                toolCalls: assistantMessage.tool_calls.map(tc => ({
                    id: tc.id,
                    name: tc.function.name,
                    arguments: JSON.parse(tc.function.arguments || '{}'),
                })),
            };
        }

        return {
            content: assistantMessage.content,
            toolCalls: null,
        };
    }

    /**
     * Start a new conversation
     */
    async startNewConversation(userId: string): Promise<void> {
        const conversation = await this.conversationService.getOrCreateConversation(userId);
        await this.conversationService.endConversation(conversation._id.toString());
    }
}
