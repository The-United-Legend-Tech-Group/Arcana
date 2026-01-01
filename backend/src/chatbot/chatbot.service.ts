import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGroq } from '@langchain/groq';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { HumanMessage, AIMessage, ToolMessage } from '@langchain/core/messages';
import { ConversationService } from './services/conversation.service';
import { ToolExecutorService, UserContext } from './services/tool-executor.service';
import { buildSystemPrompt, ERROR_MESSAGES } from './config/prompts';

@Injectable()
export class ChatbotService {
    private model: ChatGroq | null = null;
    private readonly modelName: string;
    private readonly MAX_TOOL_ITERATIONS = 5;

    constructor(
        private configService: ConfigService,
        private conversationService: ConversationService,
        private toolExecutor: ToolExecutorService,
    ) {
        // Use llama-3.1-8b-instant for faster responses and higher rate limits
        // 70B models have 12K TPM limit, 8B has 30K TPM
        this.modelName = this.configService.get<string>('GROQ_MODEL') || 'llama-3.1-8b-instant';

        const apiKey = this.configService.get<string>('GROQ_API_KEY');
        if (apiKey) {
            this.model = new ChatGroq({
                apiKey,
                model: this.modelName,
                temperature: 0.7,
                maxTokens: 1024,
            });
            console.log(`[ChatbotService] LangChain + Groq initialized (model: ${this.modelName})`);
        } else {
            console.error('[ChatbotService] ❌ No GROQ_API_KEY found');
        }
    }

    /**
     * Create LangChain tools bound to user context
     */
    private createTools(userContext: UserContext): DynamicStructuredTool[] {
        return [
            new DynamicStructuredTool({
                name: 'searchPolicies',
                description: 'Search HR policies database. Input: search query string. Returns matching policies.',
                schema: z.object({ query: z.string().describe('Search query') }),
                func: async ({ query }) => JSON.stringify(await this.toolExecutor.searchPolicies(query)),
            }),
            new DynamicStructuredTool({
                name: 'getProfile',
                description: 'Retrieves the logged-in user profile from database. No input required. Call with empty object {}.',
                schema: z.object({}),
                func: async () => JSON.stringify(await this.toolExecutor.getProfile(userContext)),
            }),
            new DynamicStructuredTool({
                name: 'findAllEmployees',
                description: 'Retrieves total employee count from database. No input required. Call with empty object {}.',
                schema: z.object({}),
                func: async () => JSON.stringify(await this.toolExecutor.findAllEmployees()),
            }),
            new DynamicStructuredTool({
                name: 'getOpenDepartments',
                description: 'Retrieves list of departments from database. No input required. Call with empty object {}.',
                schema: z.object({}),
                func: async () => JSON.stringify(await this.toolExecutor.getOpenDepartments()),
            }),
            new DynamicStructuredTool({
                name: 'getOpenPositions',
                description: 'Retrieves list of job positions from database. No input required. Call with empty object {}.',
                schema: z.object({}),
                func: async () => JSON.stringify(await this.toolExecutor.getOpenPositions()),
            }),
            new DynamicStructuredTool({
                name: 'findByRecipientId',
                description: 'Retrieves notifications for current user from database. No input required. Call with empty object {}.',
                schema: z.object({}),
                func: async () => JSON.stringify(await this.toolExecutor.findByRecipientId(userContext)),
            }),
            new DynamicStructuredTool({
                name: 'findAllPayrollPolicies',
                description: 'Retrieves payroll policies from database. Optional status filter.',
                schema: z.object({ status: z.enum(['draft', 'approved', 'rejected']).optional().describe('Optional filter') }),
                func: async ({ status }) => JSON.stringify(await this.toolExecutor.findAllPayrollPolicies({ status })),
            }),
            new DynamicStructuredTool({
                name: 'getPayrollPoliciesByType',
                description: 'Retrieves policies filtered by type from database.',
                schema: z.object({ policyType: z.enum(['Misconduct', 'Deduction', 'Allowance', 'Benefit', 'Leave']).describe('Policy type to filter') }),
                func: async ({ policyType }) => JSON.stringify(await this.toolExecutor.getPayrollPoliciesByType({ policyType })),
            }),
            new DynamicStructuredTool({
                name: 'findAllAllowances',
                description: 'Retrieves allowance configs from database. Optional status filter.',
                schema: z.object({ status: z.enum(['draft', 'approved', 'rejected']).optional().describe('Optional filter') }),
                func: async ({ status }) => JSON.stringify(await this.toolExecutor.findAllAllowances({ status })),
            }),
            new DynamicStructuredTool({
                name: 'findAllTaxRules',
                description: 'Retrieves tax rules from database. Optional status filter.',
                schema: z.object({ status: z.enum(['draft', 'approved', 'rejected']).optional().describe('Optional filter') }),
                func: async ({ status }) => JSON.stringify(await this.toolExecutor.findAllTaxRules({ status })),
            }),
            new DynamicStructuredTool({
                name: 'findAllPayGrades',
                description: 'Retrieves pay grades from database. Optional status filter.',
                schema: z.object({ status: z.enum(['draft', 'approved', 'rejected']).optional().describe('Optional filter') }),
                func: async ({ status }) => JSON.stringify(await this.toolExecutor.findAllPayGrades({ status })),
            }),
            new DynamicStructuredTool({
                name: 'getPendingApprovals',
                description: 'Retrieves pending approval counts from database. No input required. Call with empty object {}.',
                schema: z.object({}),
                func: async () => JSON.stringify(await this.toolExecutor.getPendingApprovals()),
            }),
        ];
    }

    /**
     * Load conversation history as LangChain messages
     */
    private async loadConversationMessages(
        conversationId: string
    ): Promise<Array<HumanMessage | AIMessage>> {
        const recentMessages = await this.conversationService.getRecentMessages(conversationId);
        return recentMessages.map(m =>
            m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content)
        );
    }

    /**
     * Handle API errors consistently
     */
    private handleError(error: any): string {
        console.error('[ChatbotService] ❌ Error:', error);

        if (error?.status === 429) {
            return 'I\'m receiving too many requests. Please wait a moment and try again.';
        }
        if (error?.status === 503 || error?.status === 502) {
            return ERROR_MESSAGES.LLM_UNAVAILABLE;
        }
        if (error?.message?.includes('tool_use_failed')) {
            return 'I had trouble processing that request. Could you rephrase your question?';
        }
        return `${ERROR_MESSAGES.UNKNOWN_ERROR}\n\n(Error: ${error?.message || 'Unknown'})`;
    }

    /**
     * Process a chat message using direct tool binding (avoids createAgent issues)
     */
    async processMessage(message: string, userContext: UserContext): Promise<string> {
        if (!this.model) {
            return ERROR_MESSAGES.NO_API_KEY;
        }

        try {
            // Get conversation
            const conversation = await this.conversationService.getOrCreateConversation(
                userContext.employeeId
            );
            const conversationId = conversation._id.toString();

            // Load history
            const historyMessages = await this.loadConversationMessages(conversationId);

            // Create tools and bind to model
            const tools = this.createTools(userContext);
            const modelWithTools = this.model.bindTools(tools);

            // Build messages with system prompt
            const messages: any[] = [
                { role: 'system', content: buildSystemPrompt(userContext) },
                ...historyMessages,
                new HumanMessage(message),
            ];

            // Call LLM with tool handling loop
            let response = await modelWithTools.invoke(messages);
            let iterations = 0;

            while (response.tool_calls && response.tool_calls.length > 0 && iterations < this.MAX_TOOL_ITERATIONS) {
                iterations++;
                messages.push(response);

                // Execute tools
                for (const toolCall of response.tool_calls) {
                    const tool = tools.find(t => t.name === toolCall.name);
                    let result: string;

                    if (tool) {
                        try {
                            result = await tool.invoke(toolCall.args);
                        } catch {
                            result = JSON.stringify({ success: false, error: 'Tool failed' });
                        }
                    } else {
                        result = JSON.stringify({ success: false, error: 'Unknown tool' });
                    }

                    messages.push(new ToolMessage({
                        content: result,
                        tool_call_id: toolCall.id || toolCall.name,
                    }));
                }

                response = await modelWithTools.invoke(messages);
            }

            const finalResponse = typeof response.content === 'string'
                ? response.content
                : 'I apologize, but I could not generate a response.';

            // Save to history
            await this.conversationService.addMessage(conversationId, 'user', message);
            await this.conversationService.addMessage(conversationId, 'assistant', finalResponse);
            await this.conversationService.trimMessages(conversationId, 20);

            return finalResponse;
        } catch (error: any) {
            return this.handleError(error);
        }
    }
}
