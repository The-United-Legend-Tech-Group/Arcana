import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';

interface Position {
    _id: string;
    code: string;
    title: string;
    description: string;
    departmentId: string;
    reportsToPositionId?: string;
    isActive: boolean;
}

interface CreatePositionFormProps {
    departmentId: string;
    departmentName: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function CreatePositionForm({ departmentId, departmentName, onSuccess, onCancel }: CreatePositionFormProps) {
    const [formData, setFormData] = useState({
        code: '',
        title: '',
        description: '',
        reportsToPositionId: '',
        isActive: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const token = localStorage.getItem('access_token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:50000';

            const payload: any = {
                ...formData,
                departmentId
            };

            // Clean up empty optional fields
            if (!payload.reportsToPositionId) delete payload.reportsToPositionId;

            const response = await fetch(`${apiUrl}/organization-structure/positions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to create position');
            }

            onSuccess();
        } catch (err: any) {
            console.error('Error creating position:', err);
            setError(err.message || 'Failed to create position');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
                Add Position to {departmentName}
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Stack spacing={2}>
                <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Position Code *
                    </Typography>
                    <TextField
                        name="code"
                        placeholder="e.g., ENG-SE-01"
                        value={formData.code}
                        onChange={handleChange}
                        required
                        fullWidth
                        size="small"
                        hiddenLabel
                    />
                </Box>
                <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Title *
                    </Typography>
                    <TextField
                        name="title"
                        placeholder="e.g., Senior Software Engineer"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        fullWidth
                        size="small"
                        hiddenLabel
                    />
                </Box>
                <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Description
                    </Typography>
                    <TextField
                        name="description"
                        placeholder="Enter position description..."
                        value={formData.description}
                        onChange={handleChange}
                        multiline
                        rows={1}
                        fullWidth
                        size="small"
                        hiddenLabel
                    />
                </Box>
                <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Reports To (Position ID)
                    </Typography>
                    <TextField
                        name="reportsToPositionId"
                        placeholder="Optional: Enter the ID of the position this reports to"
                        value={formData.reportsToPositionId}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                        hiddenLabel
                    />
                </Box>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={formData.isActive}
                            onChange={handleChange}
                            name="isActive"
                        />
                    }
                    label="Active"
                />

                <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button onClick={onCancel} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                        Create Position
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
}
