import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person';

interface EmployeeProfile {
    firstName: string;
    lastName: string;
    personalEmail?: string;
    workEmail?: string;
}

interface ProfileCardProps {
    profile: EmployeeProfile | null;
    profilePictureUrl: string;
    setProfilePictureUrl: (url: string) => void;
    biography: string;
    setBiography: (value: string) => void;
    setError: (error: string | null) => void;
}

export default function ProfileCard({
    profile,
    profilePictureUrl,
    setProfilePictureUrl,
    biography,
    setBiography,
    setError
}: ProfileCardProps) {
    const sanitize = (val: string | undefined | null) => (val === 'string' || val === null ? undefined : val);

    return (
        <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2 }}>
                    <Avatar
                        src={sanitize(profilePictureUrl)}
                        sx={{ width: 120, height: 120, bgcolor: 'primary.main', fontSize: 60 }}
                    >
                        {!sanitize(profilePictureUrl) && <PersonIcon fontSize="inherit" />}
                    </Avatar>
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            {sanitize(profile?.firstName)} {sanitize(profile?.lastName)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {sanitize(profile?.workEmail) || sanitize(profile?.personalEmail)}
                        </Typography>
                    </Box>

                    <Divider flexItem sx={{ my: 1, width: '100%' }} />

                    <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="profile-picture-upload"
                        type="file"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                if (file.size > 2 * 1024 * 1024) {
                                    setError('File size too large. Please select an image under 2MB.');
                                    return;
                                }

                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    setProfilePictureUrl(reader.result as string);
                                    setError(null);
                                };
                                reader.readAsDataURL(file);
                            }
                        }}
                    />
                    <label htmlFor="profile-picture-upload" style={{ width: '100%' }}>
                        <Button
                            variant="outlined"
                            component="span"
                            fullWidth
                            sx={{ mb: 2 }}
                        >
                            Upload Picture
                        </Button>
                    </label>

                    <TextField
                        fullWidth
                        placeholder="Biography"
                        multiline
                        rows={6}
                        variant="outlined"
                        value={biography}
                        onChange={(e) => setBiography(e.target.value)}
                    />
                </Box>
            </CardContent>
        </Card>
    );
}
