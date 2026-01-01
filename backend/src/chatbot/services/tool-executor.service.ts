import { Injectable, Inject, forwardRef, Optional } from '@nestjs/common';
import { EmployeeService } from '../../employee-profile/employee-profile.service';
import { OrganizationStructureService } from '../../organization-structure/organization-structure.service';
import { NotificationService } from '../../notification/notification.service';
import { ConfigSetupService } from '../../payroll-configuration/payroll-configuration.service';
import { RagService } from './rag.service';

export interface UserContext {
    employeeId: string;
    roles: string[];
    name?: string;
}

export interface ToolResult {
    success: boolean;
    data?: any;
    error?: string;
}

/**
 * Tool Executor Service
 * 
 * Minimal adapter - calls services and returns raw data with slicing.
 * No field mapping to avoid coupling with service internals.
 */
@Injectable()
export class ToolExecutorService {
    private readonly MAX_RESULTS = 15;

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
        console.log('[ToolExecutor] Initialized');
    }

    // ==================== HELPERS ====================

    private success(data: any): ToolResult {
        return { success: true, data };
    }

    private fail(error: string): ToolResult {
        return { success: false, error };
    }

    private slice<T>(arr: T[], max = this.MAX_RESULTS): T[] {
        return arr?.slice(0, max) ?? [];
    }

    private filterByStatus<T extends { status?: string }>(items: T[], status?: string): T[] {
        return status ? items.filter(i => i.status === status) : items;
    }

    // ==================== RAG SEARCH ====================

    async searchPolicies(query: string): Promise<ToolResult> {
        try {
            const results = await this.ragService.searchPolicies(query);
            return this.success({ count: results.length, policies: this.slice(results) });
        } catch {
            return this.fail('Failed to search policies');
        }
    }

    // ==================== EMPLOYEE ====================

    async getProfile(ctx: UserContext): Promise<ToolResult> {
        if (!this.employeeService) return this.fail('Employee service unavailable');
        try {
            const profile = await this.employeeService.getProfile(ctx.employeeId);
            return profile ? this.success(profile) : this.fail('Profile not found');
        } catch {
            return this.fail('Failed to fetch profile');
        }
    }

    async findAllEmployees(): Promise<ToolResult> {
        if (!this.employeeService) return this.fail('Employee service unavailable');
        try {
            const result = await this.employeeService.findAll(1, 1) as any;
            return this.success({ totalEmployees: result.total });
        } catch {
            return this.fail('Failed to count employees');
        }
    }

    // ==================== ORGANIZATION ====================

    async getOpenDepartments(): Promise<ToolResult> {
        if (!this.orgStructureService) return this.fail('Org service unavailable');
        try {
            const depts = await this.orgStructureService.getOpenDepartments();
            return this.success({ count: depts.length, departments: this.slice(depts, 20) });
        } catch {
            return this.fail('Failed to list departments');
        }
    }

    async getOpenPositions(): Promise<ToolResult> {
        if (!this.orgStructureService) return this.fail('Org service unavailable');
        try {
            const positions = await this.orgStructureService.getOpenPositions();
            return this.success({ count: positions.length, positions: this.slice(positions, 20) });
        } catch {
            return this.fail('Failed to list positions');
        }
    }

    // ==================== NOTIFICATIONS ====================

    async findByRecipientId(ctx: UserContext): Promise<ToolResult> {
        if (!this.notificationService) return this.fail('Notification service unavailable');
        try {
            const notifications = await this.notificationService.findByRecipientId(ctx.employeeId) as any[];
            return this.success({
                total: notifications.length,
                unread: notifications.filter(n => !n.isRead).length,
                recent: this.slice(notifications, 5),
            });
        } catch {
            return this.fail('Failed to fetch notifications');
        }
    }

    // ==================== PAYROLL CONFIG ====================

    async findAllPayrollPolicies(args: { status?: string }): Promise<ToolResult> {
        if (!this.configSetupService) return this.fail('Config service unavailable');
        try {
            const policies = await this.configSetupService.payrollPolicy.findAll() as any[];
            const filtered = this.filterByStatus(policies, args.status);
            return this.success({ count: filtered.length, policies: this.slice(filtered) });
        } catch {
            return this.fail('Failed to fetch policies');
        }
    }

    async getPayrollPoliciesByType(args: { policyType?: string }): Promise<ToolResult> {
        if (!this.configSetupService) return this.fail('Config service unavailable');
        try {
            const policies = await this.configSetupService.payrollPolicy.getPayrollPoliciesByType(args.policyType || '') as any[];
            return this.success({ count: policies.length, policyType: args.policyType, policies: this.slice(policies) });
        } catch {
            return this.fail('Failed to fetch policies by type');
        }
    }

    async findAllAllowances(args: { status?: string }): Promise<ToolResult> {
        if (!this.configSetupService) return this.fail('Config service unavailable');
        try {
            const items = await this.configSetupService.allowance.findAll() as any[];
            const filtered = this.filterByStatus(items, args.status);
            return this.success({ count: filtered.length, allowances: this.slice(filtered) });
        } catch {
            return this.fail('Failed to fetch allowances');
        }
    }

    async findAllTaxRules(args: { status?: string }): Promise<ToolResult> {
        if (!this.configSetupService) return this.fail('Config service unavailable');
        try {
            const items = await this.configSetupService.taxRule.findAll() as any[];
            const filtered = this.filterByStatus(items, args.status);
            return this.success({ count: filtered.length, taxRules: this.slice(filtered) });
        } catch {
            return this.fail('Failed to fetch tax rules');
        }
    }

    async findAllPayGrades(args: { status?: string }): Promise<ToolResult> {
        if (!this.configSetupService) return this.fail('Config service unavailable');
        try {
            const items = await this.configSetupService.payGrade.findAll() as any[];
            const filtered = this.filterByStatus(items, args.status);
            return this.success({ count: filtered.length, payGrades: this.slice(filtered) });
        } catch {
            return this.fail('Failed to fetch pay grades');
        }
    }

    async getPendingApprovals(): Promise<ToolResult> {
        if (!this.configSetupService) return this.fail('Config service unavailable');
        try {
            const approvals = await this.configSetupService.getPendingApprovals();
            return this.success(approvals);
        } catch {
            return this.fail('Failed to fetch pending approvals');
        }
    }
}
