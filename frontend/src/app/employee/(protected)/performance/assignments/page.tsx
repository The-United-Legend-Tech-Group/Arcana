'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Container,
    Paper,
    Typography,
    TextField,
    MenuItem,
    Stack,
    Autocomplete,
    CircularProgress,
    Alert,
} from '@mui/material';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { AppraisalCycle } from '../cycles/types';
import { AppraisalTemplate } from '../templates/types';
import { BulkAssignDto, BulkAssignItemDto, Employee } from './types';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:50000';

export default function AppraisalAssignmentsPage() {
    const router = useRouter();
    const [cycles, setCycles] = useState<AppraisalCycle[]>([]);
    const [templates, setTemplates] = useState<AppraisalTemplate[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [managers, setManagers] = useState<Employee[]>([]);
    
    const [selectedCycleId, setSelectedCycleId] = useState<string>('');
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [selectedManager, setSelectedManager] = useState<Employee | null>(null);
    
    const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>(() => ({ type: 'include', ids: new Set() }));
    const [isMounted, setIsMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        setIsMounted(true);
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const headers = {
                'Authorization': `Bearer ${token}`,
            };

            const [cyclesRes, templatesRes, employeesRes] = await Promise.all([
                fetch(`${API_URL}/performance/cycles`, { headers, credentials: 'include' }),
                fetch(`${API_URL}/performance/templates`, { headers, credentials: 'include' }),
                fetch(`${API_URL}/employee?page=1&limit=1000`, { headers, credentials: 'include' })
            ]);

            if (!cyclesRes.ok || !templatesRes.ok || !employeesRes.ok) {
                throw new Error('Failed to fetch initial data');
            }

            const cyclesData = await cyclesRes.json();
            const templatesData = await templatesRes.json();
            const employeesData = await employeesRes.json();

            setCycles(Array.isArray(cyclesData) ? cyclesData : []);
            setTemplates(Array.isArray(templatesData) ? templatesData : []);
            setEmployees(employeesData?.items || []);
            setManagers(employeesData?.items || []);
        } catch (error: any) {
            console.error('Failed to load data', error);
            setMessage({ type: 'error', text: 'Failed to load initial data' });
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        const selectedIds = Array.from(selectionModel.ids);
        if (!selectedCycleId || !selectedTemplateId || !selectedManager || selectedIds.length === 0) {
            setMessage({ type: 'error', text: 'Please select Cycle, Template, Manager and at least one Employee.' });
            return;
        }

        setAssigning(true);
        setMessage(null);

        try {
            const items: BulkAssignItemDto[] = selectedIds.map((id) => {
                const emp = employees.find(e => e._id === id);
                const item: BulkAssignItemDto = {
                    employeeProfileId: id.toString(),
                    managerProfileId: selectedManager._id,
                };
                
                // Optional: send departmentId and positionId if they exist
                if (emp?.primaryDepartmentId) {
                    const deptId = typeof emp.primaryDepartmentId === 'string' 
                        ? emp.primaryDepartmentId 
                        : emp.primaryDepartmentId._id;
                    if (deptId) item.departmentId = deptId;
                }
                
                if (emp?.primaryPositionId) {
                    const posId = typeof emp.primaryPositionId === 'string' 
                        ? emp.primaryPositionId 
                        : emp.primaryPositionId._id;
                    if (posId) item.positionId = posId;
                }
                
                return item;
            });

            const dto: BulkAssignDto = {
                cycleId: selectedCycleId,
                templateId: selectedTemplateId,
                items: items,
            };

            const response = await fetch(`${API_URL}/performance/assignments/bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
                body: JSON.stringify(dto),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to bulk assign: ${response.status} ${response.statusText} - ${errorText}`);
            }
            setMessage({ type: 'success', text: `Successfully assigned appraisal to ${items.length} employees.` });
            setSelectionModel({ type: 'include', ids: new Set() });
        } catch (error: any) {
            console.error('Failed to assign', error);
            setMessage({ type: 'error', text: error.message || 'Failed to assign appraisals' });
        } finally {
            setAssigning(false);
        }
    };

    const columns: GridColDef[] = [
        { field: 'firstName', headerName: 'First Name', width: 150 },
        { field: 'lastName', headerName: 'Last Name', width: 150 },
        { field: 'email', headerName: 'Email', width: 200 },
        { 
            field: 'department', 
            headerName: 'Department', 
            width: 150,
            valueGetter: (value: any, row: any) => row?.department?.name || row?.primaryDepartmentId?.name || 'N/A'
        },
        { 
            field: 'position', 
            headerName: 'Position', 
            width: 150,
            valueGetter: (value: any, row: any) => row?.position?.title || row?.primaryPositionId?.title || 'N/A'
        },
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Bulk Assign Appraisals
            </Typography>

            {message && (
                <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
                    {message.text}
                </Alert>
            )}

            <Paper sx={{ p: 3, mb: 3 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                    <Box flex={1}>
                        <TextField
                            select
                            fullWidth
                            label="Appraisal Cycle"
                            value={selectedCycleId}
                            onChange={(e) => setSelectedCycleId(e.target.value)}
                        >
                            {cycles.map((cycle) => (
                                <MenuItem key={cycle._id} value={cycle._id}>
                                    {cycle.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                    <Box flex={1}>
                        <TextField
                            select
                            fullWidth
                            label="Appraisal Template"
                            value={selectedTemplateId}
                            onChange={(e) => setSelectedTemplateId(e.target.value)}
                        >
                            {templates.map((template) => (
                                <MenuItem key={template._id} value={template._id}>
                                    {template.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                    <Box flex={1}>
                        <Autocomplete
                            options={managers}
                            getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.email})`}
                            value={selectedManager}
                            onChange={(event, newValue) => setSelectedManager(newValue)}
                            renderInput={(params) => <TextField {...params} label="Select Manager" fullWidth />}
                        />
                    </Box>
                </Stack>
            </Paper>

            <Paper sx={{ height: 500, width: '100%', mb: 3 }}>
                {isMounted && (
                    <DataGrid
                        rows={Array.isArray(employees) ? employees : []}
                        columns={columns}
                        getRowId={(row) => row._id}
                        checkboxSelection
                        onRowSelectionModelChange={(newSelection) => {
                            setSelectionModel(newSelection);
                        }}
                        rowSelectionModel={selectionModel}
                        loading={loading}
                        initialState={{
                            pagination: {
                                paginationModel: { pageSize: 10 },
                            },
                        }}
                        pageSizeOptions={[10, 25, 50]}
                    />
                )}
            </Paper>
            <Box display="flex" justifyContent="flex-end">
                <Button
                    variant="contained"
                    size="large"
                    onClick={handleAssign}
                    disabled={assigning || !selectedCycleId || !selectedTemplateId || !selectedManager || selectionModel.ids.size === 0}
                >
                    {assigning ? <CircularProgress size={24} /> : 'Assign Selected'}
                </Button>
            </Box>
        </Container>
    );
}
