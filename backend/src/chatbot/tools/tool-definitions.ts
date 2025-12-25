/**
 * Tool Definitions for LLM Function Calling
 * 
 * IMPORTANT: Only define tools that are IMPLEMENTED in tool-executor.service.ts
 */
export interface ToolDefinition {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: {
            type: 'object';
            properties: Record<string, any>;
            required?: string[];
        };
    };
}

export const toolDefinitions: ToolDefinition[] = [
    // ==================== EMPLOYEE PROFILE ====================
    {
        type: 'function',
        function: {
            name: 'getProfile',
            description: 'Get the current user\'s profile including name, email, department, position, and hire date',
            parameters: { type: 'object', properties: {} },
        },
    },
    {
        type: 'function',
        function: {
            name: 'findAllEmployees',
            description: 'Get the total count of active employees in the organization',
            parameters: { type: 'object', properties: {} },
        },
    },

    // ==================== ORGANIZATION ====================
    {
        type: 'function',
        function: {
            name: 'getOpenDepartments',
            description: 'List all departments in the organization',
            parameters: { type: 'object', properties: {} },
        },
    },
    {
        type: 'function',
        function: {
            name: 'getOpenPositions',
            description: 'List all positions/job roles in the organization',
            parameters: { type: 'object', properties: {} },
        },
    },

    // ==================== NOTIFICATIONS ====================
    {
        type: 'function',
        function: {
            name: 'findByRecipientId',
            description: 'Get notifications for the current user including unread count',
            parameters: { type: 'object', properties: {} },
        },
    },

    // ==================== PAYROLL POLICIES ====================
    {
        type: 'function',
        function: {
            name: 'findAllPayrollPolicies',
            description: 'Get all HR/payroll policies. Can filter by status (draft, approved, rejected)',
            parameters: {
                type: 'object',
                properties: {
                    status: {
                        type: 'string',
                        description: 'Optional filter by status',
                        enum: ['draft', 'approved', 'rejected'],
                    },
                },
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'getPayrollPoliciesByType',
            description: 'Get policies filtered by type (Misconduct, Deduction, Allowance, Benefit, Leave)',
            parameters: {
                type: 'object',
                properties: {
                    policyType: {
                        type: 'string',
                        description: 'The type of policy to search for',
                        enum: ['Misconduct', 'Deduction', 'Allowance', 'Benefit', 'Leave'],
                    },
                },
                required: ['policyType'],
            },
        },
    },

    // ==================== ALLOWANCES ====================
    {
        type: 'function',
        function: {
            name: 'findAllAllowances',
            description: 'Get all allowance configurations (housing, transport, etc.)',
            parameters: {
                type: 'object',
                properties: {
                    status: {
                        type: 'string',
                        description: 'Optional filter by status',
                        enum: ['draft', 'approved', 'rejected'],
                    },
                },
            },
        },
    },

    // ==================== TAX RULES ====================
    {
        type: 'function',
        function: {
            name: 'findAllTaxRules',
            description: 'Get all tax rules and brackets',
            parameters: {
                type: 'object',
                properties: {
                    status: {
                        type: 'string',
                        description: 'Optional filter by status',
                        enum: ['draft', 'approved', 'rejected'],
                    },
                },
            },
        },
    },

    // ==================== PAY GRADES ====================
    {
        type: 'function',
        function: {
            name: 'findAllPayGrades',
            description: 'Get all pay grade configurations with salary ranges',
            parameters: {
                type: 'object',
                properties: {
                    status: {
                        type: 'string',
                        description: 'Optional filter by status',
                        enum: ['draft', 'approved', 'rejected'],
                    },
                },
            },
        },
    },

    // ==================== PENDING APPROVALS ====================
    {
        type: 'function',
        function: {
            name: 'getPendingApprovals',
            description: 'Get count of all pending configuration approvals',
            parameters: { type: 'object', properties: {} },
        },
    },
];

/**
 * Get all tool definitions for LLM
 */
export function getToolDefinitions(): ToolDefinition[] {
    return toolDefinitions;
}

/**
 * Get tool by name
 */
export function getToolByName(name: string): ToolDefinition | undefined {
    return toolDefinitions.find(t => t.function.name === name);
}
