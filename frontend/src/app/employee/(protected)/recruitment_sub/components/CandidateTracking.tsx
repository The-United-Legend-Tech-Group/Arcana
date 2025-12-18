'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import LabelIcon from '@mui/icons-material/Label';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EmailIcon from '@mui/icons-material/Email';
import CloseIcon from '@mui/icons-material/Close';
import { recruitmentApi, employeeApi } from '@/lib/api';
import { useMutation } from '@/lib/hooks/useApi';
import { useToast } from '@/lib/hooks/useToast';

export function CandidateTracking() {
  const toast = useToast();
  const [showTagModal, setShowTagModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<Set<string>>(new Set());
  const [referralData, setReferralData] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);
  const [filterPosition, setFilterPosition] = useState('all');
  const [filterStage, setFilterStage] = useState('all');
  const [filterReferral, setFilterReferral] = useState('all');
  const [referrerName, setReferrerName] = useState('');
  const [referralNotes, setReferralNotes] = useState('');
  const [rejectionMessage, setRejectionMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      // Fetch all applications with populated candidate data
      const [applicationsResponse, referralsResponse] = await Promise.all([
        recruitmentApi.getAllApplications(),
        recruitmentApi.getAllReferrals()
      ]);

      setCandidates(applicationsResponse.data || []);

      // Build referrals set and map from backend data
      const referralCandidateIds = new Set<string>();
      const referralMap = new Map<string, any>();
      (referralsResponse.data || []).forEach((referral: any) => {
        const candidateId = referral.candidateId?._id || referral.candidateId;
        if (candidateId) {
          const candidateIdStr = candidateId.toString();
          referralCandidateIds.add(candidateIdStr);
          referralMap.set(candidateIdStr, referral);
        }
      });
      setReferrals(referralCandidateIds);
      setReferralData(referralMap);
    } catch (error: any) {
      toast.error('Failed to load candidates');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagAsReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate || !referrerName) {
      toast.error('Please enter employee number');
      return;
    }

    try {
      setIsSubmitting(true);
      const candidateId = selectedCandidate.candidateId?._id || selectedCandidate.candidateId;

      // Fetch employee by employee number
      const employee = await employeeApi.getEmployeeByEmployeeNumber(referrerName.trim());

      if (!employee || !employee._id) {
        toast.error('Employee not found with this number');
        setIsSubmitting(false);
        return;
      }

      const newReferral = await recruitmentApi.createReferral(candidateId, {
        referringEmployeeId: employee._id,
        candidateId: candidateId,
        role: referralNotes || 'Standard',
        level: referralNotes || 'Standard',
      });

      // Add to referrals set and map
      setReferrals(prev => {
        const next = new Set<string>();
        prev.forEach(v => next.add(v));
        next.add(candidateId);
        return next;
      });
      setReferralData(prev => {
        const next = new Map(prev);
        next.set(candidateId, { ...newReferral.data, referringEmployeeId: employee });
        return next;
      });
      toast.success(`Candidate tagged as referral by ${employee.employeeNumber ?? employee._id}`);
      setShowTagModal(false);
      setReferrerName('');
      setReferralNotes('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to tag as referral');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoveStage = async (candidateId: string, newStage: string) => {
    try {
      setIsSubmitting(true);
      await recruitmentApi.updateApplication(candidateId, '673a1234567890abcdef5678', {
        currentStage: newStage,
      });
      toast.success('Application stage updated');
      fetchCandidates();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update stage');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendRejection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    try {
      setIsSubmitting(true);
      await recruitmentApi.sendApplicationNotification(selectedCandidate._id, {
        candidateId: selectedCandidate.candidateId?._id || selectedCandidate.candidateId,
        hrId: '673a1234567890abcdef5678',
        customMessage: rejectionMessage,
      });

      // Update application status to rejected
      await recruitmentApi.updateApplication(selectedCandidate._id, '673a1234567890abcdef5678', {
        status: 'rejected',
      });

      toast.success('Rejection notification sent successfully');
      setShowRejectionModal(false);
      setRejectionMessage('');
      fetchCandidates();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send rejection notification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stages = ['screening', 'department_interview', 'hr_interview', 'offer'];

  const stageLabels: Record<string, string> = {
    screening: 'Screening',
    department_interview: 'Department Interview',
    hr_interview: 'HR Interview',
    offer: 'Offer'
  };

  // Check if a candidate is a referral
  const isReferral = (candidate: any) => {
    const candidateId = candidate.candidateId?._id || candidate.candidateId;
    return referrals.has(candidateId);
  };

  // Check if a candidate is rejected
  const isRejected = (candidate: any) => {
    return candidate.status === 'rejected';
  };

  // Filter candidates based on selected filters
  const filteredCandidates = candidates.filter(candidate => {
    // Filter by position
    if (filterPosition !== 'all') {
      const jobTitle = candidate.requisitionId?.title ||
        candidate.requisitionId?.templateId?.title ||
        candidate.jobRequisitionId?.title ||
        candidate.jobRequisitionId?.templateId?.title || '';
      if (jobTitle !== filterPosition) {
        return false;
      }
    }

    // Filter by stage
    if (filterStage !== 'all') {
      if (candidate.currentStage !== filterStage) {
        return false;
      }
    }

    // Filter by referral status
    if (filterReferral !== 'all') {
      const isRef = isReferral(candidate);
      if (filterReferral === 'referrals' && !isRef) {
        return false;
      }
      if (filterReferral === 'non-referrals' && isRef) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    // Sort: Active candidates first, rejected candidates at bottom
    const aRejected = isRejected(a);
    const bRejected = isRejected(b);

    if (aRejected && !bRejected) return 1;
    if (!aRejected && bRejected) return -1;
    return 0;
  });

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Candidate Tracking
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track candidates through each stage of the hiring process
        </Typography>
      </Box>

      {/* Filter Bar */}
      <Stack direction="row" spacing={2}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Position Filter</InputLabel>
          <Select
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value)}
            label="Position Filter"
          >
            <MenuItem value="all">All Positions</MenuItem>
            {/* Dynamically generate position options from candidates */}
            {Array.from(new Set(
              candidates
                .map(c => {
                  // Try to get title from requisitionId or jobRequisitionId
                  const title = c.requisitionId?.title ||
                    c.requisitionId?.templateId?.title ||
                    c.jobRequisitionId?.title ||
                    c.jobRequisitionId?.templateId?.title;
                  return title;
                })
                .filter(Boolean) // Remove null/undefined values
            )).sort().map((position: any) => (
              <MenuItem key={position} value={position}>
                {position}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Stage Filter</InputLabel>
          <Select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            label="Stage Filter"
          >
            <MenuItem value="all">All Stages</MenuItem>
            {stages.map((stage) => (
              <MenuItem key={stage} value={stage}>{stageLabels[stage]}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Referral Filter</InputLabel>
          <Select
            value={filterReferral}
            onChange={(e) => setFilterReferral(e.target.value)}
            label="Referral Filter"
          >
            <MenuItem value="all">All Candidates</MenuItem>
            <MenuItem value="referrals">Referrals Only</MenuItem>
            <MenuItem value="non-referrals">Non-Referrals</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Candidates List */}
      <Card variant="outlined">
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 12 }}>
            <CircularProgress size={32} />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              Loading candidates...
            </Typography>
          </Box>
        ) : filteredCandidates.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Candidate</TableCell>
                  <TableCell>Referral</TableCell>
                  <TableCell>Candidate Number</TableCell>
                  <TableCell>Application ID</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Stage</TableCell>
                  <TableCell>Applied</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCandidates.map((candidate) => {
                  const rejected = isRejected(candidate);
                  return (
                    <TableRow
                      key={candidate._id}
                      sx={{
                        bgcolor: rejected ? 'action.hover' : 'inherit',
                        opacity: rejected ? 0.6 : 1,
                        '&:hover': { bgcolor: rejected ? 'action.hover' : 'action.hover' }
                      }}
                    >
                      <TableCell>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              textDecoration: rejected ? 'line-through' : 'none',
                              color: rejected ? 'text.disabled' : 'text.primary'
                            }}
                          >
                            {candidate.candidateId?.firstName || ''} {candidate.candidateId?.lastName || ''}
                          </Typography>
                          <Typography variant="caption" color={rejected ? 'text.disabled' : 'text.secondary'}>
                            {candidate.candidateId?.email || ''}
                          </Typography>
                          {isReferral(candidate) && (
                            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                              <LabelIcon sx={{ fontSize: 12, color: rejected ? 'text.disabled' : 'secondary.main' }} />
                              <Typography variant="caption" color={rejected ? 'text.disabled' : 'secondary.main'}>
                                Referral
                              </Typography>
                            </Stack>
                          )}
                          {rejected && (
                            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                              <CloseIcon sx={{ fontSize: 12, color: 'error.main' }} />
                              <Typography variant="caption" color="error" fontWeight={500}>
                                Rejected
                              </Typography>
                            </Stack>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {isReferral(candidate) ? (
                          <Box>
                            <Chip label="Yes" size="small" color="secondary" />
                            {(() => {
                              const candidateId = candidate.candidateId?._id || candidate.candidateId;
                              const referralInfo = referralData.get(candidateId);
                              const employeeNumber = referralInfo?.referringEmployeeId?.employeeNumber;
                              return employeeNumber ? (
                                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                  By: {employeeNumber}
                                </Typography>
                              ) : null;
                            })()}
                          </Box>
                        ) : (
                          <Chip label="No" size="small" variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color={rejected ? 'text.disabled' : 'text.primary'}>
                          {candidate.candidateId?.candidateNumber || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color={rejected ? 'text.disabled' : 'text.primary'}>
                          {candidate._id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color={rejected ? 'text.disabled' : 'text.primary'}>
                          {candidate.requisitionId?.title ||
                            candidate.requisitionId?.templateId?.title ||
                            candidate.jobRequisitionId?.title ||
                            candidate.jobRequisitionId?.templateId?.title ||
                            'Position'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={rejected ? 'Rejected' : stageLabels[candidate.currentStage] || candidate.currentStage || candidate.status}
                          size="small"
                          color={rejected ? 'error' :
                            candidate.currentStage === 'screening' ? 'info' :
                              candidate.currentStage === 'department_interview' ? 'secondary' :
                                candidate.currentStage === 'hr_interview' ? 'warning' :
                                  candidate.currentStage === 'offer' ? 'success' : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color={rejected ? 'text.disabled' : 'text.secondary'}>
                          {new Date(candidate.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          {!rejected && !isReferral(candidate) && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="secondary"
                              onClick={() => {
                                setSelectedCandidate(candidate);
                                setShowTagModal(true);
                              }}
                            >
                              Tag as Referral
                            </Button>
                          )}
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={candidate.currentStage || ''}
                              onChange={(e) => handleMoveStage(candidate._id, e.target.value)}
                              disabled={isSubmitting || rejected}
                              displayEmpty
                            >
                              <MenuItem value="">Change Stage</MenuItem>
                              {stages.map((stage) => (
                                <MenuItem key={stage} value={stage}>
                                  {stageLabels[stage]}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            startIcon={<EmailIcon />}
                            onClick={() => {
                              setSelectedCandidate(candidate);
                              setShowRejectionModal(true);
                            }}
                            disabled={isSubmitting || rejected}
                          >
                            Send Rejection
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <PersonAddIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No candidates found
            </Typography>
          </Box>
        )}
      </Card>

      {/* Tag as Referral Modal */}
      <Dialog
        open={showTagModal && !!selectedCandidate}
        onClose={() => {
          setShowTagModal(false);
          setReferrerName('');
          setReferralNotes('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <LabelIcon color="secondary" />
            <Typography variant="h6">Tag as Referral</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Tag this candidate as a referral to give them priority in the hiring process.
          </Typography>
          <Stack spacing={3} component="form" onSubmit={handleTagAsReferral}>
            <Typography variant="body2" sx={{ mb: 1 }}>Referring Employee Number</Typography>
            <TextField
              value={referrerName}
              onChange={(e) => setReferrerName(e.target.value)}
              placeholder="Enter employee number (e.g., EMP-0001)"
              required
              fullWidth
              helperText="Enter the employee number who referred this candidate"
            />
            <Typography variant="body2" sx={{ mb: 1, mt: 2 }}>Level/Notes (Optional)</Typography>
            <TextField
              value={referralNotes}
              onChange={(e) => setReferralNotes(e.target.value)}
              placeholder="Add level or additional notes about the referral..."
              multiline
              rows={3}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowTagModal(false);
              setReferrerName('');
              setReferralNotes('');
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleTagAsReferral}
            variant="contained"
            color="secondary"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : undefined}
          >
            {isSubmitting ? 'Tagging...' : 'Tag as Referral'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Send Rejection Modal */}
      <Dialog
        open={showRejectionModal && !!selectedCandidate}
        onClose={() => {
          setShowRejectionModal(false);
          setRejectionMessage('');
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <EmailIcon color="error" />
              <Typography variant="h6">Send Rejection Notification</Typography>
            </Stack>
            <IconButton
              onClick={() => {
                setShowRejectionModal(false);
                setRejectionMessage('');
              }}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {selectedCandidate && (
            <Stack spacing={3}>
              <Card sx={{ bgcolor: 'action.hover', color: 'text.primary' }}>
                <CardContent>
                  <Typography variant="body2">
                    <strong>Candidate:</strong> {selectedCandidate.candidateId?.firstName || ''} {selectedCandidate.candidateId?.lastName || ''}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Position:</strong> {selectedCandidate.requisitionId?.title ||
                      selectedCandidate.requisitionId?.templateId?.title ||
                      selectedCandidate.jobRequisitionId?.title ||
                      selectedCandidate.jobRequisitionId?.templateId?.title ||
                      'N/A'}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Current Stage:</strong> {stageLabels[selectedCandidate.currentStage] || selectedCandidate.currentStage}
                  </Typography>
                </CardContent>
              </Card>

              <Stack spacing={2} component="form" onSubmit={handleSendRejection}>
                <Typography variant="body2" sx={{ mb: 1 }}>Rejection Message</Typography>
                <TextField
                  value={rejectionMessage}
                  onChange={(e) => setRejectionMessage(e.target.value)}
                  placeholder="Enter a personalized rejection message for the candidate..."
                  required
                  multiline
                  rows={6}
                  fullWidth
                  helperText="This message will be sent to the candidate via notification system."
                />

                <Alert severity="warning" variant="outlined">
                  ⚠️ This will automatically update the candidate's status to "Rejected" and send them a notification.
                </Alert>
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowRejectionModal(false);
              setRejectionMessage('');
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendRejection}
            variant="contained"
            color="error"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : <EmailIcon />}
          >
            {isSubmitting ? 'Sending...' : 'Send Rejection'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

