'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import DescriptionIcon from '@mui/icons-material/Description';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import WorkIcon from '@mui/icons-material/Work';
import { recruitmentApi } from '@/lib/api';
import { useToast } from '@/lib/hooks/useToast';
import { JobTemplates } from './JobTemplates';
import { JobRequisitions } from './JobRequisitions';
import { RecruitmentProcessView } from './RecruitmentProcessView';
import { OffersAndApprovals } from './OffersAndApprovals';
import { OnboardingChecklists } from './OnboardingChecklists';
import { TerminationReviews } from './TerminationReviews';
import { OffboardingClearance } from './OffboardingClearance';
import HRContracts from './HRContracts';

type Tab = 'overview' | 'job-templates' | 'job-requisitions' | 'recruitment' | 'offers' | 'contracts' | 'onboarding' | 'offboarding';

export function HRManagerDashboard() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const stats = [
    { label: 'Open Positions', value: '12', icon: WorkIcon, color: 'primary.main' },
    { label: 'Active Candidates', value: '48', icon: PeopleIcon, color: 'success.main' },
    { label: 'Pending Offers', value: '5', icon: DescriptionIcon, color: 'warning.main' },
    { label: 'New Hires (This Month)', value: '8', icon: PersonAddIcon, color: 'secondary.main' },
  ];

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: TrendingUpIcon },
    { id: 'job-templates' as Tab, label: 'Job Templates', icon: DescriptionIcon },
    { id: 'job-requisitions' as Tab, label: 'Job Requisitions', icon: WorkIcon },
    { id: 'recruitment' as Tab, label: 'Recruitment Process', icon: PeopleIcon },
    { id: 'offers' as Tab, label: 'Offers & Approvals', icon: CheckCircleIcon },
    { id: 'contracts' as Tab, label: 'Contracts', icon: DescriptionIcon },
    { id: 'onboarding' as Tab, label: 'Onboarding', icon: PersonAddIcon },
    { id: 'offboarding' as Tab, label: 'Offboarding', icon: ExitToAppIcon },
  ];

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          HR Manager Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage recruitment, onboarding, and offboarding processes
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              value={tab.id}
              label={tab.label}
              icon={<tab.icon />}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Box>

      {/* Overview */}
      {activeTab === 'overview' && (
        <Stack spacing={3}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
            {stats.map((stat) => (
              <Card key={stat.label} variant="outlined">
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {stat.label}
                      </Typography>
                      <Typography variant="h4" sx={{ mt: 1 }}>
                        {stat.value}
                      </Typography>
                    </Box>
                    <Box sx={{ bgcolor: stat.color, borderRadius: 2, p: 1.5, display: 'flex' }}>
                      <stat.icon sx={{ fontSize: 32, color: 'primary.contrastText' }} />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" fontWeight={500} sx={{ mb: 2 }}>
                  Recent Activities
                </Typography>
                <Stack spacing={2}>
                  {[
                    { action: 'Job offer approved', role: 'Senior Developer', time: '2 hours ago' },
                    { action: 'New candidate applied', role: 'Product Manager', time: '4 hours ago' },
                    { action: 'Interview scheduled', role: 'UX Designer', time: '5 hours ago' },
                    { action: 'Onboarding checklist created', role: 'Data Analyst', time: '1 day ago' },
                  ].map((activity, index) => (
                    <Stack key={index} direction="row" spacing={2} sx={{ pb: 2, borderBottom: index < 3 ? 1 : 0, borderColor: 'divider' }}>
                      <Box sx={{ width: 8, height: 8, bgcolor: 'primary.main', borderRadius: '50%', mt: 1 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2">{activity.action}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activity.role} · {activity.time}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" fontWeight={500} sx={{ mb: 2 }}>
                  Pending Actions
                </Typography>
                <Stack spacing={2}>
                  {[
                    { task: 'Review job offer for Senior Developer', priority: 'High' },
                    { task: 'Approve onboarding checklist for new hires', priority: 'Medium' },
                    { task: 'Review termination request', priority: 'High' },
                    { task: 'Update hiring process template', priority: 'Low' },
                  ].map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: 'action.hover', borderRadius: 1, color: 'text.primary' }}>
                      <Typography variant="body2">{item.task}</Typography>
                      <Chip
                        label={item.priority}
                        color={item.priority === 'High' ? 'error' : item.priority === 'Medium' ? 'warning' : 'success'}
                        size="small"
                      />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Stack>
      )}

      {activeTab === 'job-templates' && <JobTemplates />}
      {activeTab === 'job-requisitions' && <JobRequisitions />}
      {activeTab === 'recruitment' && <RecruitmentProcessView />}
      {activeTab === 'offers' && <OffersAndApprovals />}
      {activeTab === 'contracts' && <HRContracts />}
      {activeTab === 'onboarding' && <OnboardingChecklists />}
      {activeTab === 'offboarding' && (
        <Stack spacing={3}>
          <TerminationReviews />
          <OffboardingClearance />
        </Stack>
      )}
    </Stack>
  );
}

