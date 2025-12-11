'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';

interface EmployeeEditFormProps {
    employee: any;
    onUpdate: () => void;
}

export default function EmployeeEditForm({ employee, onUpdate }: EmployeeEditFormProps) {
    const router = useRouter();
    // Use dayjs for dates in state
    const [formData, setFormData] = React.useState<any>({
        firstName: '',
        middleName: '',
        lastName: '',
        nationalId: '',
        gender: '',
        maritalStatus: '',
        dateOfBirth: null,
        personalEmail: '',
        mobilePhone: '',
        homePhone: '',
        address: {
            city: '',
            streetAddress: '',
            country: ''
        },
        employeeNumber: '',
        dateOfHire: null,
        workEmail: '',
        biography: '',
        contractStartDate: null,
        contractEndDate: null,
        contractType: '',
        workType: '',
        status: '',
        profilePictureUrl: '',
        password: ''
    });

    const [loading, setLoading] = React.useState(false);
    const [success, setSuccess] = React.useState('');
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        if (employee) {
            setFormData({
                firstName: employee.firstName || '',
                middleName: employee.middleName || '',
                lastName: employee.lastName || '',
                nationalId: employee.nationalId || '',
                gender: employee.gender || '',
                maritalStatus: employee.maritalStatus || '',
                dateOfBirth: employee.dateOfBirth ? dayjs(employee.dateOfBirth) : null,
                personalEmail: employee.personalEmail || '',
                mobilePhone: employee.mobilePhone || '',
                homePhone: employee.homePhone || '',
                address: {
                    city: employee.address?.city || '',
                    streetAddress: employee.address?.streetAddress || '',
                    country: employee.address?.country || ''
                },
                employeeNumber: employee.employeeNumber || '',
                dateOfHire: employee.dateOfHire ? dayjs(employee.dateOfHire) : null,
                workEmail: employee.workEmail || '',
                biography: employee.biography || '',
                contractStartDate: employee.contractStartDate ? dayjs(employee.contractStartDate) : null,
                contractEndDate: employee.contractEndDate ? dayjs(employee.contractEndDate) : null,
                contractType: employee.contractType || '',
                workType: employee.workType || '',
                status: employee.status || '',
                profilePictureUrl: employee.profilePictureUrl || '',
                password: ''
            });
        }
    }, [employee]);

    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (field: string, value: Dayjs | null) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    }

    const handleAddressChange = (field: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            address: { ...prev.address, [field]: value }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('access_token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:50000';

            const payload: any = { ...formData };

            // Convert dayjs objects back to ISO strings
            payload.dateOfBirth = formData.dateOfBirth ? formData.dateOfBirth.toISOString() : null;
            payload.dateOfHire = formData.dateOfHire ? formData.dateOfHire.toISOString() : null;
            payload.contractStartDate = formData.contractStartDate ? formData.contractStartDate.toISOString() : null;
            payload.contractEndDate = formData.contractEndDate ? formData.contractEndDate.toISOString() : null;

            if (!payload.password) {
                delete payload.password;
            }

            const response = await fetch(`${apiUrl}/employee/${employee._id}/profile/admin`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to update profile');
            }

            setSuccess('Employee profile updated successfully');
            setFormData((prev: any) => ({ ...prev, password: '' }));
            onUpdate();
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

            <Box component="form" onSubmit={handleSubmit} noValidate>
                <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>Personal Information</Typography>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField size="small" fullWidth label="First Name" value={formData.firstName} onChange={(e) => handleChange('firstName', e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField size="small" fullWidth label="Middle Name" value={formData.middleName} onChange={(e) => handleChange('middleName', e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField size="small" fullWidth label="Last Name" value={formData.lastName} onChange={(e) => handleChange('lastName', e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField size="small" fullWidth label="National ID" value={formData.nationalId} onChange={(e) => handleChange('nationalId', e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField size="small" fullWidth label="Profile Picture URL" value={formData.profilePictureUrl} onChange={(e) => handleChange('profilePictureUrl', e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField size="small" select fullWidth label="Gender" value={formData.gender} onChange={(e) => handleChange('gender', e.target.value)}>
                            <MenuItem value="MALE">Male</MenuItem>
                            <MenuItem value="FEMALE">Female</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField size="small" select fullWidth label="Marital Status" value={formData.maritalStatus} onChange={(e) => handleChange('maritalStatus', e.target.value)}>
                            <MenuItem value="SINGLE">Single</MenuItem>
                            <MenuItem value="MARRIED">Married</MenuItem>
                            <MenuItem value="DIVORCED">Divorced</MenuItem>
                            <MenuItem value="WIDOWED">Widowed</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <DatePicker
                            label="Date of Birth"
                            value={formData.dateOfBirth}
                            onChange={(newValue) => handleDateChange('dateOfBirth', newValue)}
                            slotProps={{ textField: { fullWidth: true, variant: 'outlined', size: 'small' } }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <TextField size="small" fullWidth multiline rows={1} label="Biography" value={formData.biography} onChange={(e) => handleChange('biography', e.target.value)} />
                    </Grid>
                </Grid>

                <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 4 }}>Security</Typography>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            size="small"
                            fullWidth
                            type="password"
                            autoComplete="new-password"
                            label="New Password (leave blank to keep current)"
                            value={formData.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            helperText="Only enter a value if you want to change the user's password"
                        />
                    </Grid>
                </Grid>

                <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 4 }}>Contact Information</Typography>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField size="small" fullWidth label="Personal Email" value={formData.personalEmail} onChange={(e) => handleChange('personalEmail', e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField size="small" fullWidth label="Work Email" value={formData.workEmail} onChange={(e) => handleChange('workEmail', e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField size="small" fullWidth label="Mobile Phone" value={formData.mobilePhone} onChange={(e) => handleChange('mobilePhone', e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField size="small" fullWidth label="Home Phone" value={formData.homePhone} onChange={(e) => handleChange('homePhone', e.target.value)} />
                    </Grid>
                </Grid>

                <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 4 }}>Address</Typography>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField size="small" fullWidth label="City" value={formData.address.city} onChange={(e) => handleAddressChange('city', e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField size="small" fullWidth label="Street Address" value={formData.address.streetAddress} onChange={(e) => handleAddressChange('streetAddress', e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField size="small" fullWidth label="Country" value={formData.address.country} onChange={(e) => handleAddressChange('country', e.target.value)} />
                    </Grid>
                </Grid>

                <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 4 }}>Employment Details</Typography>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField size="small" fullWidth label="Employee Number" value={formData.employeeNumber} onChange={(e) => handleChange('employeeNumber', e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField size="small" select fullWidth label="Status" value={formData.status} onChange={(e) => handleChange('status', e.target.value)}>
                            <MenuItem value="ACTIVE">Active</MenuItem>
                            <MenuItem value="INACTIVE">Inactive</MenuItem>
                            <MenuItem value="ON_LEAVE">On Leave</MenuItem>
                            <MenuItem value="SUSPENDED">Suspended</MenuItem>
                            <MenuItem value="RETIRED">Retired</MenuItem>
                            <MenuItem value="PROBATION">Probation</MenuItem>
                            <MenuItem value="TERMINATED">Terminated</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <DatePicker
                            label="Date of Hire"
                            value={formData.dateOfHire}
                            onChange={(newValue) => handleDateChange('dateOfHire', newValue)}
                            slotProps={{ textField: { fullWidth: true, variant: 'outlined', size: 'small' } }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField size="small" select fullWidth label="Contract Type" value={formData.contractType} onChange={(e) => handleChange('contractType', e.target.value)}>
                            <MenuItem value="FULL_TIME_CONTRACT">Full Time Contract</MenuItem>
                            <MenuItem value="PART_TIME_CONTRACT">Part Time Contract</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField size="small" select fullWidth label="Work Type" value={formData.workType} onChange={(e) => handleChange('workType', e.target.value)}>
                            <MenuItem value="FULL_TIME">Full Time</MenuItem>
                            <MenuItem value="PART_TIME">Part Time</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <DatePicker
                            label="Contract Start Date"
                            value={formData.contractStartDate}
                            onChange={(newValue) => handleDateChange('contractStartDate', newValue)}
                            slotProps={{ textField: { fullWidth: true, variant: 'outlined', size: 'small' } }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <DatePicker
                            label="Contract End Date"
                            value={formData.contractEndDate}
                            onChange={(newValue) => handleDateChange('contractEndDate', newValue)}
                            slotProps={{ textField: { fullWidth: true, variant: 'outlined', size: 'small' } }}
                        />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                    <Button
                        variant="contained"
                        color="inherit"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => router.back()}
                    >
                        Back
                    </Button>
                    <Button variant="contained" type="submit" disabled={loading} size="large">
                        {loading ? <CircularProgress size={24} /> : 'Save'}
                    </Button>
                </Box>
            </Box>
        </LocalizationProvider>
    );
}
