import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import SaveIcon from '@mui/icons-material/Save';
import CircularProgress from '@mui/material/CircularProgress';

interface ContactCardProps {
    saving: boolean;
    handleSaveProfile: () => void;
    mobilePhone: string;
    setMobilePhone: (value: string) => void;
    homePhone: string;
    setHomePhone: (value: string) => void;
    streetAddress: string;
    setStreetAddress: (value: string) => void;
    city: string;
    setCity: (value: string) => void;
    country: string;
    setCountry: (value: string) => void;
}

export default function ContactCard({
    saving,
    handleSaveProfile,
    mobilePhone,
    setMobilePhone,
    homePhone,
    setHomePhone,
    streetAddress,
    setStreetAddress,
    city,
    setCity,
    country,
    setCountry
}: ContactCardProps) {
    return (
        <Card variant="outlined" sx={{ height: '100%' }}>
            <CardHeader
                title="Personal Information"
                subheader="Update your biography and contact details"
                action={
                    <Button
                        variant="contained"
                        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        onClick={handleSaveProfile}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                }
            />
            <Divider />
            <CardContent>
                <Stack spacing={3}>
                    <Box>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>Phone Numbers</Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    placeholder="Mobile Phone"
                                    value={mobilePhone}
                                    onChange={(e) => setMobilePhone(e.target.value)}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    placeholder="Home Phone"
                                    value={homePhone}
                                    onChange={(e) => setHomePhone(e.target.value)}
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider />

                    <Box>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>Address</Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    placeholder="Street Address"
                                    value={streetAddress}
                                    onChange={(e) => setStreetAddress(e.target.value)}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    placeholder="City"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    placeholder="Country"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}
