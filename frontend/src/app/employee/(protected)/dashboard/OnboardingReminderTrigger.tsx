'use client';

import { useEffect } from 'react';
import { recruitmentApi } from '@/lib/api';
import { decryptData } from '../../../../common/utils/encryption';

export default function OnboardingReminderTrigger() {
    useEffect(() => {
        const triggerReminders = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const encryptedId = localStorage.getItem('employeeId');

                if (token && encryptedId) {
                    const decryptedId = await decryptData(encryptedId, token);
                    if (decryptedId) {
                        // Trigger onboarding reminders for tasks due in 3, 2, or 1 days
                        try {
                            await recruitmentApi.sendOnboardingReminders({
                                employeeId: decryptedId,
                                daysBeforeDeadline: 3
                            });
                        } catch (reminderError) {
                            // Silent fail for reminders as it's a background task
                            console.warn('Failed to send onboarding reminders:', reminderError);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to trigger onboarding reminders:', error);
            }
        };

        triggerReminders();
    }, []);

    return null; // This component doesn't render anything
}
