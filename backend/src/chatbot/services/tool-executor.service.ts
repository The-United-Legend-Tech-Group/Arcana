import { Injectable, Inject, forwardRef, Optional } from '@nestjs/common';
import { EmployeeService } from '../../employee-profile/employee-profile.service';
import { OrganizationStructureService } from '../../organization-structure/organization-structure.service';
import { NotificationService } from '../../notification/notification.service';
import { ConfigSetupService } from '../../payroll-configuration/payroll-configuration.service';
import { RagService } from './rag.service';

interface UserContext {
    employeeId: string;
    roles: string[];
    name?: string;
}

interface ToolResult {
    success: boolean;
    data?: any;
    error?: string;
}

/**
 * Tool Executor Service
 * 
 * Uses services for proper abstraction. Services are @Optional to handle
 * cases where they might not be available.
 */
@Injectable()
export class ToolExecutorService {
    constructor(
        private readonly ragService: RagService,
        @Optional() @Inject(forwardRef(() => EmployeeService))
        private readonly employeeService: EmployeeService,
        @Optional() @Inject(forwardRef(() => OrganizationStructureService))
        private readonly orgStructureService: OrganizationStructureService,
        @Optional() @Inject(forwardRef(() => NotificationService))
        private readonly notificationService: NotificationService,
        @Optional() @Inject(forwardRef(() => ConfigSetupService))
        private readonly configSetupService: ConfigSetupService,
    ) {
        console.log('[ToolExecutor] Initialized with RAG support');
    }

    /**
     * Execute a tool by name with given arguments
     */
    async executeTool(
        toolName: string,
        args: Record<string, any>,
        userContext: UserContext,
    ): Promise<ToolResult> {
        console.log(`[ToolExecutor] Executing: ${toolName}`, { args });

        try {
            switch (toolName) {
                // RAG Search Tool
                case 'searchPolicies': return await this.searchPolicies(args.query);

                // Employee Tools
                case 'getProfile': return await this.getProfile(userContext);
                case 'findAllEmployees': return await this.findAllEmployees();

                // Organization Tools
                case 'getOpenDepartments': return await this.getOpenDepartments();
                case 'getOpenPositions': return await this.getOpenPositions();

                // Notification Tools
                case 'findByRecipientId': return await this.findByRecipientId(userContext);

                // Payroll Config Tools
                case 'findAllPayrollPolicies': return await this.findAllPayrollPolicies(args);
                case 'getPayrollPoliciesByType': return await this.getPayrollPoliciesByType(args);
                case 'findAllAllowances': return await this.findAllAllowances(args);
                case 'findAllTaxRules': return await this.findAllTaxRules(args);
                case 'findAllPayGrades': return await this.findAllPayGrades(args);
                case 'getPendingApprovals': return await this.getPendingApprovals();

                default:
                    return { success: false, error: `Unknown tool: ${toolName}` };
            }
        } catch (error) {
            console.error(`[ToolExecutor] Error in ${toolName}:`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Tool execution failed'
            };
        }
    }

    // ==================== RAG SEARCH ====================

    private async searchPolicies(query: string): Promise<ToolResult> {
        try {
            const results = await this.ragService.searchPolicies(query);

            if (results.length === 0) {
                return {
                    success: true,
                    data: { message: 'No policies found matching your query.', policies: [] },
                };
            }

            return {
                success: true,
                data: {
                    count: results.length,
                    policies: results.map(p => ({
                        name: p.policyName,
                        type: p.policyType,
                        status: p.status,
                        description: p.description,
                        relevance: p.score ? Math.round(p.score * 100) / 100 : undefined,
                    })),
                },
            };
        } catch {
            return { success: false, error: 'Failed to search policies' };
        }
    }

    // ==================== EMPLOYEE TOOLS ====================

    private async getProfile(ctx: UserContext): Promise<ToolResult> {
        if (!this.employeeService) return { success: false, error: 'Employee service unavailable' };
        try {
            const profile = await this.employeeService.getProfile(ctx.employeeId) as any;
            if (!profile) return { success: false, error: 'Profile not found' };

            return {
                success: true,
                data: {
                    name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
                    email: profile.workEmail || profile.personalEmail,
                    employeeNumber: profile.employeeNumber,
                    status: profile.status,
                    department: profile.primaryDepartmentId?.name || 'Not assigned',
                    position: profile.primaryPositionId?.title || 'Not assigned',
                    dateOfHire: profile.dateOfHire,
                },
            };
        } catch { return { success: false, error: 'Failed to fetch profile' }; }
    }

    private async findAllEmployees(): Promise<ToolResult> {
        if (!this.employeeService) return { success: false, error: 'Employee service unavailable' };
        try {
            const result = await this.employeeService.findAll(1, 1);
            return { success: true, data: { totalEmployees: result.total } };
        } catch { return { success: false, error: 'Failed to count employees' }; }
    }

    // ==================== ORGANIZATION TOOLS ====================

    private async getOpenDepartments(): Promise<ToolResult> {
        if (!this.orgStructureService) return { success: false, error: 'Org service unavailable' };
        try {
            const departments = await this.orgStructureService.getOpenDepartments();
            return {
                success: true,
                data: {
                    count: departments.length,
                    departments: departments.slice(0, 20).map((d: any) => ({
                        name: d.name,
                        description: d.description,
                    })),
                },
            };
        } catch { return { success: false, error: 'Failed to list departments' }; }
    }

    private async getOpenPositions(): Promise<ToolResult> {
        if (!this.orgStructureService) return { success: false, error: 'Org service unavailable' };
        try {
            const positions = await this.orgStructureService.getOpenPositions();
            return {
                success: true,
                data: {
                    count: positions.length,
                    positions: positions.slice(0, 20).map((p: any) => ({
                        title: p.title,
                        department: p.departmentId?.name,
                    })),
                },
            };
        } catch { return { success: false, error: 'Failed to list positions' }; }
    }

    // ==================== NOTIFICATION TOOLS ====================

    private async findByRecipientId(ctx: UserContext): Promise<ToolResult> {
        if (!this.notificationService) return { success: false, error: 'Notification service unavailable' };
        try {
            const notifications = await this.notificationService.findByRecipientId(ctx.employeeId);
            const unread = notifications.filter((n: any) => !n.isRead);

            return {
                success: true,
                data: {
                    total: notifications.length,
                    unread: unread.length,
                    recent: notifications.slice(0, 5).map((n: any) => ({
                        type: n.type,
                        message: n.message,
                        isRead: n.isRead,
                    })),
                },
            };
        } catch { return { success: false, error: 'Failed to fetch notifications' }; }
    }

    // ==================== PAYROLL CONFIG TOOLS ====================

    private async findAllPayrollPolicies(args: { status?: string }): Promise<ToolResult> {
        if (!this.configSetupService) return { success: false, error: 'Config service unavailable' };
        try {
            const policies = await this.configSetupService.payrollPolicy.findAll() as any[];
            let filtered = policies;
            if (args.status) filtered = filtered.filter(p => p.status === args.status);

            return {
                success: true,
                data: {
                    count: filtered.length,
                    policies: filtered.slice(0, 15).map(p => ({
                        name: p.policyName,
                        type: p.policyType,
                        status: p.status,
                        description: p.description?.substring(0, 150),
                    })),
                },
            };
        } catch { return { success: false, error: 'Failed to fetch policies' }; }
    }

    private async getPayrollPoliciesByType(args: { policyType?: string }): Promise<ToolResult> {
        if (!this.configSetupService) return { success: false, error: 'Config service unavailable' };
        try {
            const policies = await this.configSetupService.payrollPolicy.getPayrollPoliciesByType(args.policyType || '') as any[];
            return {
                success: true,
                data: {
                    count: policies.length,
                    policyType: args.policyType,
                    policies: policies.slice(0, 15).map(p => ({
                        name: p.policyName,
                        status: p.status,
                    })),
                },
            };
        } catch { return { success: false, error: 'Failed to fetch policies by type' }; }
    }

    private async findAllAllowances(args: { status?: string }): Promise<ToolResult> {
        if (!this.configSetupService) return { success: false, error: 'Config service unavailable' };
        try {
            const allowances = await this.configSetupService.allowance.findAll() as any[];
            let filtered = allowances;
            if (args.status) filtered = filtered.filter(a => a.status === args.status);

            return {
                success: true,
                data: {
                    count: filtered.length,
                    allowances: filtered.slice(0, 15).map(a => ({
                        name: a.name || a.allowanceName,
                        amount: a.amount,
                        status: a.status,
                    })),
                },
            };
        } catch { return { success: false, error: 'Failed to fetch allowances' }; }
    }

    private async findAllTaxRules(args: { status?: string }): Promise<ToolResult> {
        if (!this.configSetupService) return { success: false, error: 'Config service unavailable' };
        try {
            const rules = await this.configSetupService.taxRule.findAll() as any[];
            let filtered = rules;
            if (args.status) filtered = filtered.filter(r => r.status === args.status);

            return {
                success: true,
                data: {
                    count: filtered.length,
                    taxRules: filtered.slice(0, 15).map(r => ({
                        name: r.taxName || r.name,
                        rate: r.rate,
                        status: r.status,
                    })),
                },
            };
        } catch { return { success: false, error: 'Failed to fetch tax rules' }; }
    }

    private async findAllPayGrades(args: { status?: string }): Promise<ToolResult> {
        if (!this.configSetupService) return { success: false, error: 'Config service unavailable' };
        try {
            const grades = await this.configSetupService.payGrade.findAll() as any[];
            let filtered = grades;
            if (args.status) filtered = filtered.filter(g => g.status === args.status);

            return {
                success: true,
                data: {
                    count: filtered.length,
                    payGrades: filtered.slice(0, 15).map(g => ({
                        grade: g.grade,
                        minSalary: g.minSalary,
                        maxSalary: g.maxSalary,
                        status: g.status,
                    })),
                },
            };
        } catch { return { success: false, error: 'Failed to fetch pay grades' }; }
    }

    private async getPendingApprovals(): Promise<ToolResult> {
        if (!this.configSetupService) return { success: false, error: 'Config service unavailable' };
        try {
            const approvals = await this.configSetupService.getPendingApprovals();
            return { success: true, data: approvals };
        } catch { return { success: false, error: 'Failed to fetch pending approvals' }; }
    }
}
