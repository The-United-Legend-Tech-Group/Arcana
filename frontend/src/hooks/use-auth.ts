'use client';

import { useState, useEffect } from 'react';
import { getUserRoles } from '@/common/utils/cookie-utils';
import { SystemRole } from '@/types/auth';

export const useAuth = () => {
    const [roles, setRoles] = useState<SystemRole[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadRoles = () => {
            try {
                const fetchedRoles = getUserRoles();
                if (Array.isArray(fetchedRoles)) {
                    setRoles(fetchedRoles as SystemRole[]);
                }
            } catch (error) {
                console.error('Failed to load user roles:', error);
            } finally {
                setLoading(false);
            }
        };

        loadRoles();
    }, []);

    const hasRole = (requiredRoles: SystemRole | SystemRole[]) => {
        if (loading) return false; // Or manage loading state in consumer
        const required = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
        // If no roles required, allow
        if (required.length === 0) return true;

        return required.some(role => roles.includes(role));
    };

    const hasAllRoles = (requiredRoles: SystemRole[]) => {
        if (loading) return false;
        return requiredRoles.every(role => roles.includes(role));
    }

    return { roles, loading, hasRole, hasAllRoles };
};
