'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import Grid from '@mui/material/Grid';
import NewLeaveRequestForm from './_components/NewLeaveRequestForm';
import ManageLeaveRequestsPanel from './_components/ManageLeaveRequestsPanel';

export default function LeaveRequestsPage() {
  return (
    <Box
      sx={{
        px: { xs: 1.5, md: 2.5 },
        pb: 3,
        pt: 1,
        width: '100%',
      }}
    >
      <Box
        sx={{
          mb: 2,
        }}
      >
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Leave Requests
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Submit new leave requests, attach supporting documents, and manage your pending requests.
        </Typography>
      </Box>

      <Grid container spacing={2} columns={12} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={(theme) => ({
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: theme.palette.divider,
              backgroundColor: theme.vars
                ? `rgba(${theme.vars.palette.background.paperChannel} / 0.9)`
                : theme.palette.background.paper,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            })}
          >
            <Typography variant="subtitle1" fontWeight={600} mb={1.5}>
              New Leave Request
            </Typography>
            <NewLeaveRequestForm />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={(theme) => ({
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: theme.palette.divider,
              backgroundColor: theme.vars
                ? `rgba(${theme.vars.palette.background.paperChannel} / 0.9)`
                : theme.palette.background.paper,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            })}
          >
            <Typography variant="subtitle1" fontWeight={600} mb={1.5}>
              Manage Requests
            </Typography>
            <ManageLeaveRequestsPanel />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}


