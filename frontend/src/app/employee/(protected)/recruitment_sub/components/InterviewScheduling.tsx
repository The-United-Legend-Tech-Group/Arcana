'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { recruitmentApi, employeeApi } from '@/lib/api';
import { useToast } from '@/lib/hooks/useToast';

interface InterviewFormData {
  applicationId: string;
  stage: 'hr_interview' | 'department_interview';
  scheduledDate: string;
  method: 'onsite' | 'video' | 'phone';
  panel: string[];
  videoLink: string;
}

export function InterviewScheduling() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [panelInput, setPanelInput] = useState('');
  const [panelMembers, setPanelMembers] = useState<{ number: string; id: string }[]>([]);

  const [formData, setFormData] = useState<InterviewFormData>({
    applicationId: '',
    stage: 'hr_interview',
    scheduledDate: '',
    method: 'video',
    panel: [],
    videoLink: '',
  });

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setFormData({
      applicationId: '',
      stage: 'hr_interview',
      scheduledDate: '',
      method: 'video',
      panel: [],
      videoLink: '',
    });
    setPanelInput('');
    setPanelMembers([]);
  };

  const handleAddPanelMember = async () => {
    const trimmed = panelInput.trim();
    if (!trimmed) {
      toast.error('Please enter an employee number');
      return;
    }

    // Check if already added by number or ID
    if (panelMembers.some((m) => m.number === trimmed || m.id === trimmed)) {
      toast.warning('This employee is already added');
      return;
    }

    try {
      // Fetch employee by employee number
      const employee = await employeeApi.getEmployeeByEmployeeNumber(trimmed);

      if (!employee || !employee._id) {
        toast.error('Employee not found with this number');
        return;
      }

      // Add to panel members list
      const newMember = { number: employee.employeeNumber, id: employee._id };
      setPanelMembers([...panelMembers, newMember]);
      setFormData({ ...formData, panel: [...formData.panel, employee._id] });
      setPanelInput('');
      toast.success(`Added ${employee.employeeNumber}`);
    } catch (error: any) {
      console.error('Failed to fetch employee:', error);
      toast.error('Failed to find employee. Please check the employee number.');
    }
  };

  const handleRemovePanelMember = (employeeId: string) => {
    const updatedMembers = panelMembers.filter((m) => m.id !== employeeId);
    setPanelMembers(updatedMembers);
    setFormData({ ...formData, panel: updatedMembers.map((m) => m.id) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('=== Form submitted ===');
    console.log('Form data:', formData);

    // Check authentication
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    console.log('Auth token exists:', !!token);

    if (!token) {
      console.error('No auth token found');
      toast.error('You must be logged in to schedule interviews');
      return;
    }

    // Validation
    console.log('Validating form data...');

    if (!formData.applicationId.trim()) {
      console.error('Validation failed: Application ID missing');
      toast.error('Application ID is required');
      return;
    }
    if (!formData.scheduledDate) {
      console.error('Validation failed: Scheduled date missing');
      toast.error('Interview date and time is required');
      return;
    }
    if (formData.panel.length === 0) {
      console.error('Validation failed: No panel members');
      toast.error('At least one panel member is required');
      return;
    }
    if (formData.method === 'video' && !formData.videoLink.trim()) {
      console.error('Validation failed: Video link missing for video interview');
      toast.error('Video link is required for video interviews');
      return;
    }

    console.log('Validation passed');

    try {
      setSubmitting(true);

      // Convert local datetime to ISO string
      const scheduledDateIso = new Date(formData.scheduledDate).toISOString();

      // Backend will derive hrId from auth token (req.user.sub)
      const payload = {
        applicationId: formData.applicationId.trim(),
        stage: formData.stage,
        scheduledDate: scheduledDateIso,
        method: formData.method,
        panel: formData.panel,
        videoLink: formData.method === 'video' ? formData.videoLink.trim() : undefined,
      };

      console.log('Creating interview with payload:', payload);
      console.log('Auth token present:', !!token);

      const response = await recruitmentApi.createInterview(payload);

      console.log('Interview created successfully:', response.data);
      toast.success('Interview scheduled successfully!');
      handleClose();
    } catch (error: any) {
      console.error('Failed to create interview:', error);

      if (error?.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
      } else if (error?.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }

      // Extract error message
      let errorMsg = 'Failed to schedule interview';

      if (error?.response?.data) {
        const data = error.response.data;
        if (typeof data === 'string') {
          errorMsg = data;
        } else if (data.message) {
          errorMsg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        } else if (data.error) {
          errorMsg = data.error;
        }
      } else if (error?.message) {
        errorMsg = error.message;
      }

      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Interview Scheduling
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage interview schedules
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
          Schedule Interview
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Click "Schedule Interview" to create a new interview for an application.
          </Typography>
        </CardContent>
      </Card>

      {/* Create Interview Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Schedule Interview</DialogTitle>

          <DialogContent dividers>
            <Stack spacing={2.5}>
              {/* Application ID */}
              <TextField
                label="Application ID"
                value={formData.applicationId}
                onChange={(e) => setFormData({ ...formData, applicationId: e.target.value })}
                placeholder="Enter application MongoDB ObjectId"
                required
                fullWidth
                helperText="The ID of the job application for this interview"
              />

              {/* Interview Stage */}
              <FormControl fullWidth required>
                <InputLabel>Interview Stage</InputLabel>
                <Select
                  value={formData.stage}
                  label="Interview Stage"
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value as any })}
                >
                  <MenuItem value="hr_interview">HR Interview</MenuItem>
                  <MenuItem value="department_interview">Department Interview</MenuItem>
                </Select>
              </FormControl>

              {/* Interview Method */}
              <FormControl fullWidth required>
                <InputLabel>Interview Method</InputLabel>
                <Select
                  value={formData.method}
                  label="Interview Method"
                  onChange={(e) => setFormData({ ...formData, method: e.target.value as any })}
                >
                  <MenuItem value="video">Video Call</MenuItem>
                  <MenuItem value="onsite">On-site</MenuItem>
                  <MenuItem value="phone">Phone Call</MenuItem>
                </Select>
              </FormControl>

              {/* Scheduled Date & Time */}
              <TextField
                label="Interview Date & Time"
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
                helperText="Select the date and time for the interview"
              />

              {/* Video Link */}
              {formData.method === 'video' && (
                <TextField
                  label="Video Link"
                  type="url"
                  value={formData.videoLink}
                  onChange={(e) => setFormData({ ...formData, videoLink: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  required={formData.method === 'video'}
                  fullWidth
                  helperText="Video conference link for the interview"
                />
              )}

              {/* Panel Members */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Panel Members *
                </Typography>

                {/* Display Panel Members */}
                {panelMembers.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {panelMembers.map((member) => (
                      <Chip
                        key={member.id}
                        label={`Employee #${member.number}`}
                        onDelete={() => handleRemovePanelMember(member.id)}
                        deleteIcon={<DeleteIcon />}
                        size="small"
                      />
                    ))}
                  </Box>
                )}

                {/* Add Panel Member */}
                <Stack direction="row" spacing={1}>
                  <TextField
                    value={panelInput}
                    onChange={(e) => setPanelInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddPanelMember();
                      }
                    }}
                    placeholder="Enter employee number (e.g., EMP-0001)"
                    size="small"
                    fullWidth
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddPanelMember}
                    disabled={!panelInput.trim()}
                  >
                    Add
                  </Button>
                </Stack>
                <FormHelperText>
                  Add one or more employee numbers (press Enter or click Add)
                </FormHelperText>
              </Box>
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              startIcon={submitting && <CircularProgress size={16} />}
              onClick={() => console.log('Create Interview button clicked')}
            >
              {submitting ? 'Creating...' : 'Create Interview'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

