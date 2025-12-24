import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Import schemas for database access
import { EmployeeProfile, EmployeeProfileDocument } from '../employee-profile/models/employee-profile.schema';
import { payrollPolicies, payrollPoliciesDocument } from '../payroll-configuration/models/payrollPolicies.schema';
import { Department, DepartmentDocument } from '../organization-structure/models/department.schema';
import { Position, PositionDocument } from '../organization-structure/models/position.schema';
import { LeaveRequest, LeaveRequestDocument } from '../leaves/models/leave-request.schema';

interface UserContext {
    employeeId: string;
    roles: string[];
    name?: string;
}

interface QueryResult {
    type: string;
    data: any;
    description: string;
}

@Injectable()
export class ChatbotService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(
        private configService: ConfigService,
        @InjectModel(EmployeeProfile.name) private employeeModel: Model<EmployeeProfileDocument>,
        @InjectModel(payrollPolicies.name) private policyModel: Model<payrollPoliciesDocument>,
        @InjectModel(Department.name) private departmentModel: Model<DepartmentDocument>,
        @InjectModel(Position.name) private positionModel: Model<PositionDocument>,
        @InjectModel(LeaveRequest.name) private leaveRequestModel: Model<LeaveRequestDocument>,
    ) {
        // Get API key from structured config or fall back to direct env var
        const apiKey = this.configService.get<string>('gemini.apiKey') ||
            this.configService.get<string>('GOOGLE_GEMINI_API_KEY');
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        }
    }

    /**
     * Process a chat message and return an AI-generated response
     */
    async processMessage(message: string, userContext: UserContext): Promise<string> {
        try {
            // Step 1: Get user profile data
            const userProfile = await this.getUserProfile(userContext.employeeId);

            // Step 2: Parse intent and gather relevant data
            const queryResults = await this.gatherRelevantData(message, userContext, userProfile);

            // Step 3: Generate response using Gemini AI
            const response = await this.generateResponse(message, userContext, userProfile, queryResults);

            return response;
        } catch (error) {
            console.error('ChatBot error:', error);
            return 'I apologize, but I encountered an error processing your request. Please try again.';
        }
    }

    /**
     * Get the current user's profile
     */
    private async getUserProfile(employeeId: string): Promise<any> {
        try {
            const employee = await this.employeeModel
                .findById(employeeId)
                .populate('primaryDepartmentId')
                .populate('primaryPositionId')
                .lean();
            return employee;
        } catch {
            return null;
        }
    }

    /**
     * Gather relevant data based on the user's message
     */
    private async gatherRelevantData(
        message: string,
        userContext: UserContext,
        userProfile: any
    ): Promise<QueryResult[]> {
        const results: QueryResult[] = [];
        const lowerMessage = message.toLowerCase();

        // Identity queries - "who am i", "my profile", etc.
        if (this.matchesIntent(lowerMessage, ['who am i', 'my name', 'my profile', 'about me'])) {
            results.push({
                type: 'user_profile',
                data: userProfile,
                description: 'User profile information'
            });
        }

        // Policy queries - count, list policies
        if (this.matchesIntent(lowerMessage, ['polic', 'misconduct', 'deduction', 'allowance', 'benefit'])) {
            const policyData = await this.queryPolicies(lowerMessage);
            results.push({
                type: 'policies',
                data: policyData,
                description: 'Payroll policies data'
            });
        }

        // Department queries
        if (this.matchesIntent(lowerMessage, ['department', 'team', 'org', 'organization'])) {
            const deptData = await this.queryDepartments(lowerMessage, userProfile);
            results.push({
                type: 'departments',
                data: deptData,
                description: 'Department information'
            });
        }

        // Position queries
        if (this.matchesIntent(lowerMessage, ['position', 'role', 'job', 'title'])) {
            const positionData = await this.queryPositions(lowerMessage, userProfile);
            results.push({
                type: 'positions',
                data: positionData,
                description: 'Position information'
            });
        }

        // Leave queries
        if (this.matchesIntent(lowerMessage, ['leave', 'vacation', 'time off', 'absence'])) {
            const leaveData = await this.queryLeaves(userContext.employeeId);
            results.push({
                type: 'leaves',
                data: leaveData,
                description: 'Leave requests data'
            });
        }

        // Employee count/list queries
        if (this.matchesIntent(lowerMessage, ['employee', 'staff', 'worker', 'how many people'])) {
            const employeeData = await this.queryEmployees(lowerMessage);
            results.push({
                type: 'employees',
                data: employeeData,
                description: 'Employee information'
            });
        }

        return results;
    }

    /**
     * Check if message matches any of the intent keywords
     */
    private matchesIntent(message: string, keywords: string[]): boolean {
        return keywords.some(keyword => message.includes(keyword));
    }

    /**
     * Query policies based on message content
     */
    private async queryPolicies(message: string): Promise<any> {
        const lowerMessage = message.toLowerCase();

        // Build filter based on message
        const filter: any = {};

        if (lowerMessage.includes('approved')) {
            filter.status = 'approved';
        } else if (lowerMessage.includes('draft')) {
            filter.status = 'draft';
        } else if (lowerMessage.includes('rejected')) {
            filter.status = 'rejected';
        }

        if (lowerMessage.includes('misconduct')) {
            filter.policyType = 'Misconduct';
        } else if (lowerMessage.includes('deduction')) {
            filter.policyType = 'Deduction';
        } else if (lowerMessage.includes('allowance')) {
            filter.policyType = 'Allowance';
        } else if (lowerMessage.includes('benefit')) {
            filter.policyType = 'Benefit';
        } else if (lowerMessage.includes('leave')) {
            filter.policyType = 'Leave';
        }

        const [policies, count] = await Promise.all([
            this.policyModel.find(filter).limit(10).lean(),
            this.policyModel.countDocuments(filter)
        ]);

        return { policies, count, filter };
    }

    /**
     * Query departments
     */
    private async queryDepartments(message: string, userProfile: any): Promise<any> {
        const lowerMessage = message.toLowerCase();

        // If asking about "my department"
        if (lowerMessage.includes('my department') && userProfile?.primaryDepartmentId) {
            return {
                myDepartment: userProfile.primaryDepartmentId,
                type: 'user_department'
            };
        }

        // General department query
        const departments = await this.departmentModel.find().limit(20).lean();
        const count = await this.departmentModel.countDocuments();

        return { departments, count };
    }

    /**
     * Query positions
     */
    private async queryPositions(message: string, userProfile: any): Promise<any> {
        const lowerMessage = message.toLowerCase();

        // If asking about "my position"
        if (lowerMessage.includes('my position') && userProfile?.primaryPositionId) {
            return {
                myPosition: userProfile.primaryPositionId,
                type: 'user_position'
            };
        }

        const positions = await this.positionModel.find().limit(20).lean();
        const count = await this.positionModel.countDocuments();

        return { positions, count };
    }

    /**
     * Query leave requests for a user
     */
    private async queryLeaves(employeeId: string): Promise<any> {
        const leaves = await this.leaveRequestModel
            .find({ employeeId })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        const stats = {
            total: leaves.length,
            pending: leaves.filter(l => l.status === 'pending').length,
            approved: leaves.filter(l => l.status === 'approved').length,
            rejected: leaves.filter(l => l.status === 'rejected').length,
        };

        return { leaves, stats };
    }

    /**
     * Query employees
     */
    private async queryEmployees(message: string): Promise<any> {
        const count = await this.employeeModel.countDocuments({ status: 'ACTIVE' });

        return {
            totalActive: count,
            type: 'employee_count'
        };
    }

    /**
     * Generate a response using Gemini AI
     */
    private async generateResponse(
        message: string,
        userContext: UserContext,
        userProfile: any,
        queryResults: QueryResult[]
    ): Promise<string> {
        // If Gemini is not configured, use fallback
        if (!this.model) {
            return this.generateFallbackResponse(message, userProfile, queryResults);
        }

        try {
            // Build context for Gemini
            const contextInfo = this.buildContextString(userProfile, queryResults);

            const prompt = `You are Arcana, a helpful AI assistant for an HR management system. 
You have access to the following information about the user and their organization:

${contextInfo}

User's question: "${message}"

Provide a helpful, concise, and friendly response based on the available data. 
If you don't have enough information to answer, say so politely.
Keep responses under 150 words unless detailed information is specifically requested.
Do not make up information that is not in the provided context.`;

            const result = await this.model.generateContent(prompt);
            const response = result.response;
            return response.text();
        } catch (error) {
            console.error('Gemini API error:', error);
            return this.generateFallbackResponse(message, userProfile, queryResults);
        }
    }

    /**
     * Build context string for AI prompt
     */
    private buildContextString(userProfile: any, queryResults: QueryResult[]): string {
        let context = '';

        if (userProfile) {
            context += `\n--- Current User ---\n`;
            context += `Name: ${userProfile.firstName || ''} ${userProfile.lastName || ''}\n`;
            context += `Email: ${userProfile.workEmail || userProfile.email || 'Not set'}\n`;
            context += `Employee Number: ${userProfile.employeeNumber || 'Not set'}\n`;
            context += `Status: ${userProfile.status || 'Unknown'}\n`;
            if (userProfile.primaryDepartmentId?.name) {
                context += `Department: ${userProfile.primaryDepartmentId.name}\n`;
            }
            if (userProfile.primaryPositionId?.title) {
                context += `Position: ${userProfile.primaryPositionId.title}\n`;
            }
        }

        for (const result of queryResults) {
            context += `\n--- ${result.description} ---\n`;

            if (result.type === 'policies') {
                const { count, filter, policies } = result.data;
                context += `Total matching policies: ${count}\n`;
                if (filter.status) context += `Status filter: ${filter.status}\n`;
                if (filter.policyType) context += `Type filter: ${filter.policyType}\n`;
                if (policies.length > 0) {
                    context += `Sample policies:\n`;
                    policies.slice(0, 3).forEach((p: any) => {
                        context += `  - ${p.policyName} (${p.policyType}, ${p.status})\n`;
                    });
                }
            }

            if (result.type === 'departments') {
                if (result.data.myDepartment) {
                    context += `User's Department: ${result.data.myDepartment.name || 'Unknown'}\n`;
                } else {
                    context += `Total departments: ${result.data.count}\n`;
                }
            }

            if (result.type === 'positions') {
                if (result.data.myPosition) {
                    context += `User's Position: ${result.data.myPosition.title || 'Unknown'}\n`;
                } else {
                    context += `Total positions: ${result.data.count}\n`;
                }
            }

            if (result.type === 'leaves') {
                const { stats } = result.data;
                context += `Leave requests - Total: ${stats.total}, Pending: ${stats.pending}, Approved: ${stats.approved}\n`;
            }

            if (result.type === 'employees') {
                context += `Total active employees: ${result.data.totalActive}\n`;
            }
        }

        return context;
    }

    /**
     * Fallback response when Gemini is unavailable
     */
    private generateFallbackResponse(
        message: string,
        userProfile: any,
        queryResults: QueryResult[]
    ): string {
        const lowerMessage = message.toLowerCase();

        // Handle "who am i" type queries
        if (this.matchesIntent(lowerMessage, ['who am i', 'my name', 'my profile'])) {
            if (userProfile) {
                const name = `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim();
                const dept = userProfile.primaryDepartmentId?.name || 'Not assigned';
                const position = userProfile.primaryPositionId?.title || 'Not assigned';
                return `You are ${name || 'a registered employee'}. You work in the ${dept} department as ${position}.`;
            }
            return 'I could not find your profile information.';
        }

        // Handle policy count queries
        const policyResult = queryResults.find(r => r.type === 'policies');
        if (policyResult) {
            const { count, filter } = policyResult.data;
            let msg = `There are ${count}`;
            if (filter.status) msg += ` ${filter.status}`;
            if (filter.policyType) msg += ` ${filter.policyType}`;
            msg += ` policies.`;
            return msg;
        }

        // Handle department queries
        const deptResult = queryResults.find(r => r.type === 'departments');
        if (deptResult && deptResult.data.myDepartment) {
            return `Your department is ${deptResult.data.myDepartment.name}.`;
        }

        // Handle leave queries
        const leaveResult = queryResults.find(r => r.type === 'leaves');
        if (leaveResult) {
            const { stats } = leaveResult.data;
            return `You have ${stats.total} leave requests: ${stats.pending} pending, ${stats.approved} approved.`;
        }

        return 'I\'m here to help! You can ask me about your profile, policies, departments, positions, or leave requests.';
    }
}
