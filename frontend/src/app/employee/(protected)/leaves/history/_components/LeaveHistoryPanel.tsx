'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Stack,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Button,
  Grid,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

type LeaveHistoryItem = {
  requestId: string;
  leaveType: string | {
    _id: string;
    name?: string;
    code?: string;
  };
  startDate: string | Date;
  endDate: string | Date;
  durationDays: number;
  justification?: string;
  status: string;
  approvalFlow?: Array<{
    role: string;
    status: string;
    decidedBy: string;
    decidedAt: Date;
  }>;
};

type LeaveType = {
  _id: string;
  code?: string;
  name?: string;
};

function formatDate(value: any): string {
  if (!value) return 'N/A';
  if (typeof value === 'object' && value.$date) {
    value = value.$date;
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString();
}

export default function LeaveHistoryPanel() {
  const [history, setHistory] = useState<LeaveHistoryItem[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    leaveTypeId: '',
    status: '',
    from: '',
    to: '',
  });

  const loadLeaveTypes = useCallback(async () => {
    if (!API_BASE) return;
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE}/leaves/leave-types`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setLeaveTypes(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load leave types:', err);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    if (!API_BASE) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      
      // Build query params
      const params = new URLSearchParams();
      if (filters.leaveTypeId) params.append('leaveTypeId', filters.leaveTypeId);
      if (filters.status) params.append('status', filters.status);
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);

      const res = await fetch(`${API_BASE}/leaves-report/my-history?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ message: 'Failed to load history' }));
        throw new Error(errData.message || `Failed (${res.status})`);
      }

      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load leave history');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadLeaveTypes();
  }, [loadLeaveTypes]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      leaveTypeId: '',
      status: '',
      from: '',
      to: '',
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getLeaveTypeName = (leaveType: string | any): string => {
    if (typeof leaveType === 'object' && leaveType) {
      return `${leaveType.code || ''} ${leaveType.name || ''}`.trim() || 'Unknown';
    }
    return typeof leaveType === 'string' ? `Type: ${leaveType.slice(-8)}` : 'Unknown';
  };

  const hasActiveFilters = filters.leaveTypeId || filters.status || filters.from || filters.to;

  return (
    <Stack spacing={2}>
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <FilterListIcon color="action" />
          <Typography variant="h6" fontWeight={600}>
            Filters
          </Typography>
          {hasActiveFilters && (
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              sx={{ ml: 'auto' }}
            >
              Clear Filters
            </Button>
          )}
        </Stack>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              label="Leave Type"
              value={filters.leaveTypeId}
              onChange={(e) => handleFilterChange('leaveTypeId', e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="">All Types</MenuItem>
              {leaveTypes.map((lt) => (
                <MenuItem key={lt._id} value={lt._id}>
                  {lt.code && lt.name ? `${lt.code} — ${lt.name}` : lt.code || lt.name || lt._id}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              label="Status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="From Date"
              type="date"
              value={filters.from}
              onChange={(e) => handleFilterChange('from', e.target.value)}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="To Date"
              type="date"
              value={filters.to}
              onChange={(e) => handleFilterChange('to', e.target.value)}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* History Table */}
      <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Leave History ({history.length} {history.length === 1 ? 'request' : 'requests'})
          </Typography>
          <IconButton onClick={loadHistory} disabled={loading} size="small">
            <RefreshIcon />
          </IconButton>
        </Stack>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Leave Type</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell align="right">Duration</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Justification</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.requestId} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {getLeaveTypeName(item.leaveType)}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(item.startDate)}</TableCell>
                    <TableCell>{formatDate(item.endDate)}</TableCell>
                    <TableCell align="right">{item.durationDays} {item.durationDays === 1 ? 'day' : 'days'}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.status || 'N/A'}
                        color={getStatusColor(item.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                        {item.justification || 'N/A'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
                {history.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        {hasActiveFilters ? 'No leave requests match your filters' : 'No leave history found'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Stack>
  );
}

