'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SendIcon from '@mui/icons-material/Send';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import InventoryIcon from '@mui/icons-material/Inventory';
import { recruitmentApi } from '@/lib/api';
import { useToast } from '@/lib/hooks/useToast';
import { JobPostings } from './JobPostings';
import { CandidateTracking } from './CandidateTracking';
import { InterviewScheduling } from './InterviewScheduling';
import { AllAssessments } from './AllAssessments';
import { RejectionNotifications } from './RejectionNotifications';
import { ResourceReservation } from './ResourceReservation';

type Tab = 'overview' | 'job-postings' | 'candidates' | 'interviews' | 'all-assessments' | 'notifications' | 'resources';
export function HREmployeeDashboard() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: PeopleIcon },
    { id: 'job-postings' as Tab, label: 'Job Postings', icon: SendIcon },
    { id: 'candidates' as Tab, label: 'Candidate Tracking', icon: PeopleIcon },
    { id: 'interviews' as Tab, label: 'Interview Scheduling', icon: CalendarTodayIcon },
    { id: 'all-assessments' as Tab, label: 'Assessments & Scoring', icon: AssignmentIcon },
    { id: 'notifications' as Tab, label: 'Notifications', icon: SendIcon },
    { id: 'resources' as Tab, label: 'Resource Reservation', icon: InventoryIcon },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
            HR Employee Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage daily recruitment and onboarding activities
          </Typography>
        </Box>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <Tab
                key={tab.id}
                value={tab.id}
                label={tab.label}
                icon={<IconComponent />}
                iconPosition="start"
                sx={{ textTransform: 'none', minHeight: 48 }}
              />
            );
          })}
        </Tabs>

        {/* Content */}
        {activeTab === 'overview' && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                  <PeopleIcon color="primary" />
                  <Typography variant="h6">Today&apos;s Tasks</Typography>
                </Stack>
                <Stack spacing={1}>
                  {[
                    'Review 5 new applications',
                    'Schedule 3 interviews',
                    'Send rejection emails (2)',
                    'Update candidate statuses',
                  ].map((task, index) => (
                    <FormControlLabel
                      key={index}
                      control={<Checkbox size="small" />}
                      label={<Typography variant="body2">{task}</Typography>}
                    />
                  ))}
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                  <CalendarTodayIcon color="success" />
                  <Typography variant="h6">Upcoming Interviews</Typography>
                </Stack>
                <Stack spacing={2}>
                  {[
                    { candidate: 'John Doe', role: 'Senior Developer', time: '10:00 AM' },
                    { candidate: 'Jane Smith', role: 'Product Manager', time: '2:00 PM' },
                    { candidate: 'Mike Johnson', role: 'UX Designer', time: '4:00 PM' },
                  ].map((interview, index) => (
                    <Box key={index} sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1, color: 'text.primary' }}>
                      <Typography variant="body2">{interview.candidate}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {interview.role} · {interview.time}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                  <LocalOfferIcon color="secondary" />
                  <Typography variant="h6">Referral Candidates</Typography>
                </Stack>
                <Stack spacing={2}>
                  {[
                    { name: 'Sarah Wilson', referredBy: 'Tom Brown', status: 'Screening' },
                    { name: 'Alex Chen', referredBy: 'Lisa Gray', status: 'Interview' },
                  ].map((referral, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 1.5,
                        bgcolor: 'action.hover',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        color: 'text.primary'
                      }}
                    >
                      <Typography variant="body2">{referral.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Referred by {referral.referredBy}
                      </Typography>
                      <Box
                        component="span"
                        sx={{
                          display: 'inline-block',
                          mt: 0.5,
                          px: 1,
                          py: 0.25,
                          bgcolor: 'secondary.light',
                          color: 'secondary.contrastText',
                          borderRadius: 0.5,
                          fontSize: '0.75rem'
                        }}
                      >
                        {referral.status}
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Box>
        )}

        {activeTab === 'job-postings' && <JobPostings />}
        {activeTab === 'candidates' && <CandidateTracking />}
        {activeTab === 'interviews' && <InterviewScheduling />}
        {activeTab === 'all-assessments' && <AllAssessments />}
        {activeTab === 'notifications' && <RejectionNotifications />}
        {activeTab === 'resources' && <ResourceReservation />}
      </Stack>
    </Box>
  );
}

