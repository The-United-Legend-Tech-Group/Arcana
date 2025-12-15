'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

enum SystemRole {
    DEPARTMENT_EMPLOYEE = 'department employee',
    DEPARTMENT_HEAD = 'department head',
    HR_MANAGER = 'HR Manager',
    HR_EMPLOYEE = 'HR Employee',
    PAYROLL_SPECIALIST = 'Payroll Specialist',
    SYSTEM_ADMIN = 'System Admin',
    LEGAL_POLICY_ADMIN = 'Legal & Policy Admin',
    RECRUITER = 'Recruiter',
    FINANCE_STAFF = 'Finance Staff',
    JOB_CANDIDATE = 'Job Candidate',
    HR_ADMIN = 'HR Admin',
    PAYROLL_MANAGER = 'Payroll Manager',
}

interface EmployeeRoleFormProps {
    employeeId: string;
    currentRoles: string[];
    currentPermissions?: string[];
    onUpdate: () => void;
}

export default function EmployeeRoleForm({ employeeId, currentRoles, currentPermissions = [], onUpdate }: EmployeeRoleFormProps) {
    const [roles, setRoles] = React.useState<string[]>(currentRoles || []);
    const [permissions, setPermissions] = React.useState<string[]>(currentPermissions || []);
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [rolesOpen, setRolesOpen] = React.useState(false);
    const [permissionsOpen, setPermissionsOpen] = React.useState(false);

    React.useEffect(() => {
        setRoles(currentRoles || []);
        setPermissions(currentPermissions || []);
    }, [currentRoles, currentPermissions]);


    const toggleRolesOpen = () => {
        setRolesOpen((prev) => !prev);
    };

    const togglePermissionsOpen = () => {
        setPermissionsOpen((prev) => !prev);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setMessage(null);

        try {
            const token = localStorage.getItem('access_token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:50000';

            const response = await fetch(`${apiUrl}/employee/${employeeId}/roles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ roles, permissions })
            });

            if (!response.ok) {
                throw new Error('Failed to update roles');
            }

            setMessage({ type: 'success', text: 'Roles and permissions updated successfully' });
            onUpdate();
        } catch (error) {
            setMessage({ type: 'error', text: 'Error updating roles' });
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                System Roles
            </Typography>

            {message && (
                <Alert severity={message.type} sx={{ mb: 3 }}>
                    {message.text}
                </Alert>
            )}

            <Grid container spacing={3} alignItems="flex-start">
                {/* Current Roles Display */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default', height: '100%' }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                            Current Roles
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {currentRoles.length > 0 ? (
                                currentRoles.map((role, index) => (
                                    <Chip
                                        key={index}
                                        label={role}
                                        color="primary"
                                        variant="filled"
                                        size="medium"
                                    />
                                ))
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    No roles assigned
                                </Typography>
                            )}
                        </Stack>
                    </Paper>
                </Grid>

                {/* Current Permissions Display */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default', height: '100%' }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                            Current Permissions
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {currentPermissions.length > 0 ? (
                                currentPermissions.map((permission, index) => (
                                    <Chip
                                        key={index}
                                        label={permission}
                                        color="secondary"
                                        variant="filled"
                                        size="medium"
                                    />
                                ))
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    No permissions assigned
                                </Typography>
                            )}
                        </Stack>
                    </Paper>
                </Grid>

                {/* Role Selection */}
                <Grid size={{ xs: 12 }}>
                    <Box sx={{ mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight={500}>
                            Modify Roles
                        </Typography>
                    </Box>
                    <Grid container spacing={2} alignItems="stretch">
                        <Grid size={{ xs: 12, md: 9 }} sx={{ display: 'flex' }}>
                            <Autocomplete
                                multiple
                                open={rolesOpen}
                                onOpen={() => setRolesOpen(true)}
                                onClose={() => setRolesOpen(false)}
                                options={Object.values(SystemRole)}
                                value={roles}
                                onChange={(event, newValue) => {
                                    setRoles(newValue);
                                }}
                                forcePopupIcon={false}
                                sx={{ flexGrow: 1 }}
                                renderTags={(value: readonly string[], getTagProps) =>
                                    value.map((option: string, index: number) => {
                                        const { key, ...tagProps } = getTagProps({ index });
                                        return (
                                            <Chip variant="outlined" label={option} key={key} {...tagProps} />
                                        );
                                    })
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Select roles to assign"
                                    />
                                )}
                            />
                            <Button
                                variant="outlined"
                                onClick={toggleRolesOpen}
                                sx={{ ml: 1, minWidth: 0, px: 1, borderColor: 'rgba(0, 0, 0, 0.23)' }}
                            >
                                <ArrowDropDownIcon />
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Permissions Selection */}
                <Grid size={{ xs: 12 }}>
                    <Box sx={{ mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight={500}>
                            Modify Permissions
                        </Typography>
                    </Box>
                    <Grid container spacing={2} alignItems="stretch">
                        <Grid size={{ xs: 12, md: 9 }} sx={{ display: 'flex' }}>
                            <Autocomplete
                                multiple
                                freeSolo
                                open={permissionsOpen}
                                onOpen={() => setPermissionsOpen(true)}
                                onClose={() => setPermissionsOpen(false)}
                                options={[]}
                                value={permissions}
                                onChange={(event, newValue) => {
                                    setPermissions(newValue);
                                }}
                                forcePopupIcon={false}
                                sx={{ flexGrow: 1 }}
                                renderTags={(value: readonly string[], getTagProps) =>
                                    value.map((option: string, index: number) => {
                                        const { key, ...tagProps } = getTagProps({ index });
                                        return (
                                            <Chip variant="outlined" label={option} key={key} {...tagProps} />
                                        );
                                    })
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Type and press Enter to add permissions"
                                    />
                                )}
                            />
                            <Button
                                variant="outlined"
                                onClick={togglePermissionsOpen}
                                sx={{ ml: 1, minWidth: 0, px: 1, borderColor: 'rgba(0, 0, 0, 0.23)' }}
                            >
                                <ArrowDropDownIcon />
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Submit Button */}
                <Grid size={{ xs: 12 }}>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading}
                        size="large"
                        sx={{ px: 4 }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Update Roles & Permissions'}
                    </Button>
                </Grid>
            </Grid>
        </Paper>
    );
}
