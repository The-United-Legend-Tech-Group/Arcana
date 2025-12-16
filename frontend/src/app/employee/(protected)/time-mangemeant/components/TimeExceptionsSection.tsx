"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "@mui/material/styles";

import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import SectionHeading from "./SectionHeading";
import {
  TimeException,
  TimeExceptionStatus,
  TimeExceptionType,
  SectionDefinition,
} from "./types";

/**
 * ESS Attendance Correction (SubmitCorrectionEssDto)
 * Backend endpoint:
 * POST /api/time/corrections/submit-ess
 */

type TimeExceptionsSectionProps = {
  section: SectionDefinition;
  exceptions: TimeException[];
  loading: boolean;
  employeeId: string;
  lineManagerId: string;
  onCreated?: () => void; // trigger parent refresh
};

const EXCEPTION_TYPE_LABELS: Record<TimeExceptionType, string> = {
  [TimeExceptionType.MISSED_PUNCH]: "Missed Punch",
  [TimeExceptionType.LATE]: "Late Arrival",
  [TimeExceptionType.EARLY_LEAVE]: "Early Leave",
  [TimeExceptionType.SHORT_TIME]: "Short Time",
  [TimeExceptionType.OVERTIME_REQUEST]: "Overtime Request",
  [TimeExceptionType.MANUAL_ADJUSTMENT]: "Manual Adjustment",
};

const EXCEPTION_STATUS_CONFIG: Record<
  TimeExceptionStatus,
  { label: string; color: "default" | "success" | "warning" | "error" | "info" }
> = {
  [TimeExceptionStatus.OPEN]: { label: "Open", color: "warning" },
  [TimeExceptionStatus.PENDING]: { label: "Pending", color: "info" },
  [TimeExceptionStatus.APPROVED]: { label: "Approved", color: "success" },
  [TimeExceptionStatus.REJECTED]: { label: "Rejected", color: "error" },
  [TimeExceptionStatus.ESCALATED]: { label: "Escalated", color: "error" },
  [TimeExceptionStatus.RESOLVED]: { label: "Resolved", color: "success" },
};

export default function TimeExceptionsSection({
  section,
  exceptions,
  loading,
  employeeId,
  lineManagerId,
  onCreated,
}: TimeExceptionsSectionProps) {
  const theme = useTheme();

  // ---------------- Dialog state ----------------
  const [openDialog, setOpenDialog] = React.useState(false);
  const [date, setDate] = React.useState("");
  const [durationMinutes, setDurationMinutes] = React.useState<number>(0);
  const [correctionType, setCorrectionType] = React.useState<'ADD' | 'DEDUCT'>('ADD');
  const [reason, setReason] = React.useState("");

  const [attendanceRecordId, setAttendanceRecordId] = React.useState<string | null>(null);
  const [fetchingRecord, setFetchingRecord] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  // Fetch attendance record when date changes
  React.useEffect(() => {
    if (!date) return;

    const fetchRecord = async () => {
      try {
        setFetchingRecord(true);
        setError(null);

        const res = await fetch(
          `/api/time/attendance/records/${employeeId}?startDate=${date}&endDate=${date}`
        );

        if (!res.ok) throw new Error('Failed to fetch attendance record');

        const data = await res.json();
        const record = data?.data?.[0] || data?.[0];

        if (!record?._id) {
          setAttendanceRecordId(null);
          setError('No attendance record found for selected date');
        } else {
          setAttendanceRecordId(record._id);
        }
      } catch (e: any) {
        setAttendanceRecordId(null);
        setError(e.message || 'Error fetching attendance record');
      } finally {
        setFetchingRecord(false);
      }
    };

    fetchRecord();
  }, [date, employeeId]);

  const handleSubmit = async () => {
    if (!attendanceRecordId) return;

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const res = await fetch('/api/time/corrections/submit-ess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          attendanceRecord: attendanceRecordId,
          durationMinutes,
          reason,
          lineManagerId,
          correctionType,
          appliesFromDate: date,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      setSuccess('Correction request submitted successfully and sent to your manager.');
      onCreated?.();

      // keep dialog open briefly to show confirmation
      setTimeout(() => {
        setOpenDialog(false);
        setDate('');
        setDurationMinutes(15);
        setReason('');
        setAttendanceRecordId(null);
        setSuccess(null);
      }, 1200);
    } catch (e: any) {
      setError(e.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const sortedExceptions = React.useMemo(() => {
    return [...exceptions].sort((a, b) => {
      const p: Record<TimeExceptionStatus, number> = {
        OPEN: 1,
        PENDING: 2,
        ESCALATED: 3,
        APPROVED: 4,
        RESOLVED: 5,
        REJECTED: 6,
      } as any;
      return (p[a.status] || 99) - (p[b.status] || 99);
    });
  }, [exceptions]);

  return (
    <Box>
      <SectionHeading {...section} />

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={() => setOpenDialog(true)}>
          Request attendance correction
        </Button>
      </Box>

      <Card variant="outlined">
        <CardContent>
          {loading ? (
            <Skeleton height={200} />
          ) : (
            <Stack spacing={3}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <Box sx={{ flex: 1, p: 2, borderRadius: 2, bgcolor: theme.palette.warning.main + '15' }}>
                  <WarningAmberIcon color="warning" />
                  <Typography variant="h5" fontWeight="bold">
                    {exceptions.filter(e => e.status === TimeExceptionStatus.OPEN || e.status === TimeExceptionStatus.PENDING).length}
                  </Typography>
                  <Typography variant="body2">Open / Pending</Typography>
                </Box>
                <Box sx={{ flex: 1, p: 2, borderRadius: 2, bgcolor: theme.palette.success.main + '15' }}>
                  <CheckCircleOutlineIcon color="success" />
                  <Typography variant="h5" fontWeight="bold">
                    {exceptions.filter(e => e.status === TimeExceptionStatus.APPROVED || e.status === TimeExceptionStatus.RESOLVED).length}
                  </Typography>
                  <Typography variant="body2">Resolved</Typography>
                </Box>
              </Stack>

              {sortedExceptions.length === 0 ? (
                <Alert severity="success">No time exceptions recorded.</Alert>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Reason</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedExceptions.map(ex => {
                      const cfg = EXCEPTION_STATUS_CONFIG[ex.status];
                      return (
                        <TableRow key={ex._id}>
                          <TableCell>{EXCEPTION_TYPE_LABELS[ex.type]}</TableCell>
                          <TableCell>
                            <Chip size="small" label={cfg.label} color={cfg.color} variant="outlined" />
                          </TableCell>
                          <TableCell>{ex.reason || '-'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* ESS Correction Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle>Attendance Correction Request</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              type="date"
              label="Date"
              InputLabelProps={{ shrink: true }}
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />

            <TextField
              type="number"
              label="Duration (minutes)"
              value={durationMinutes}
              onChange={e => setDurationMinutes(Number(e.target.value))}
              required
            />

            <TextField
              select
              label="Correction Type"
              value={correctionType}
              onChange={e => setCorrectionType(e.target.value as any)}
            >
              <MenuItem value="ADD">Add minutes</MenuItem>
              <MenuItem value="DEDUCT">Deduct minutes</MenuItem>
            </TextField>

            <TextField
              label="Reason"
              multiline
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
            />

            {fetchingRecord && <Alert severity="info">Checking attendance record…</Alert>}
            {attendanceRecordId && !error && (
              <Alert severity="success">Attendance record found ✔</Alert>
            )}
            {success && <Alert severity="success">{success}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={submitting}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!attendanceRecordId || !reason || durationMinutes <= 0 || submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : null}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
