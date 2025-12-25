import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { ConversationService } from './services/conversation.service';
import { ToolExecutorService } from './services/tool-executor.service';
import { getToolDefinitions } from './tools/tool-definitions';

interface UserContext {
    employeeId: string;
    roles: string[];
    name?: string;
}

@Injectable()
export class ChatbotService {
    private groq: Groq | null = null;
    private readonly modelName = 'llama-3.3-70b-versatile';
    private readonly MAX_TOOL_ITERATIONS = 5;

    constructor(
        private configService: ConfigService,
        private conversationService: ConversationService,
        private toolExecutor: ToolExecutorService,
    ) {
        const apiKey = this.configService.get<string>('groq.apiKey') ||
            this.configService.get<string>('GROQ_API_KEY');
        if (apiKey) {
            this.groq = new Groq({ apiKey });
            console.log('[ChatbotService] Groq AI initialized with', getToolDefinitions().length, 'tools');
        } else {
            console.error('[ChatbotService] No GROQ_API_KEY found');
        }
    }

    /**
     * Process a chat message with conversation context and tool calling
     */
    async processMessage(message: string, userContext: UserContext): Promise<string> {
        if (!this.groq) {
            throw new Error('Groq AI is not configured. Please set GROQ_API_KEY in your .env file.');
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
                { role: 'system', content: this.buildSystemPrompt(userContext) },
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
        } catch (error) {
            console.error('[ChatbotService] Error:', error);
            throw error;
        }
    }

    /**
     * Call LLM with tool definitions
     */
    private async callLLMWithTools(messages: any[]): Promise<{
        content: string | null;
        toolCalls: Array<{ id: string; name: string; arguments: any }> | null;
    }> {
        try {
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
        } catch (error) {
            console.error('[ChatbotService] LLM call error:', error);
            throw error;
        }
    }

    /**
     * Build system prompt with user context
     */
    private buildSystemPrompt(userContext: UserContext): string {
        return `You are Arcana, an intelligent HR assistant for an organization.

You have access to tools that fetch real data. ALWAYS USE TOOLS when users ask about:
- Their profile or personal info → use getProfile
- Employees count → use findAllEmployees
- Departments → use getOpenDepartments
- Positions/roles → use getOpenPositions
- Notifications → use findByRecipientId
- Policies → use findAllPayrollPolicies or getPayrollPoliciesByType
- Allowances → use findAllAllowances
- Tax rules → use findAllTaxRules
- Pay grades → use findAllPayGrades
- Pending approvals → use getPendingApprovals

GUIDELINES:
1. ALWAYS call a tool when the user asks for data - don't guess or make up information
2. After getting tool results, summarize the data in a friendly, conversational way
3. Keep responses concise (under 150 words unless more detail needed)
4. If a tool fails, explain the issue politely
5. Remember context from the conversation

Current user:
- ID: ${userContext.employeeId}
- Name: ${userContext.name || 'Employee'}
- Roles: ${userContext.roles.join(', ') || 'Standard User'}`;
    }

    /**
     * Start a new conversation
     */
    async startNewConversation(userId: string): Promise<void> {
        const conversation = await this.conversationService.getOrCreateConversation(userId);
        await this.conversationService.endConversation(conversation._id.toString());
    }
}
