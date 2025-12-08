'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { alpha, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Fade from '@mui/material/Fade';
import Chip from '@mui/material/Chip';

// Adjust imports if needed

interface TeamMember {
    _id: string;
    firstName: string;
    lastName: string;
    position?: { title: string };
    department?: { name: string };
    profilePictureUrl?: string; // Assuming this might exist or we use a placeholder
    email: string;
    status: string;
}

interface TeamData {
    manager: TeamMember; // Ideally we fetch the manager's details too
    members: TeamMember[];
}

export default function TeamPage(props: { disableCustomTheme?: boolean }) {
    const router = useRouter();
    const theme = useTheme();
    const [loading, setLoading] = React.useState(true);
    const [team, setTeam] = React.useState<TeamMember[]>([]);
    const [manager, setManager] = React.useState<TeamMember | null>(null);
    const [hoveredMember, setHoveredMember] = React.useState<TeamMember | null>(null);

    React.useEffect(() => {
        const fetchTeam = async () => {
            const token = localStorage.getItem('access_token');
            const employeeId = localStorage.getItem('employeeId');

            if (!token || !employeeId) {
                router.push('/employee/login');
                return;
            }

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:50000';

                // Fetch current user (Manager) profile first to show in center
                const profileRes = await fetch(`${apiUrl}/employee/${employeeId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    setManager(profileData.profile || profileData);
                }

                // Fetch team profiles
                const response = await fetch(`${apiUrl}/employee/team/profiles?managerId=${employeeId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setTeam(data.items || []);
                } else {
                    console.error('Failed to fetch team', response.status, response.statusText);
                    const text = await response.text();
                    console.error('Response body:', text);
                }
            } catch (error) {
                console.error('Failed to fetch team', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTeam();
    }, [router]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // --- Creative Layout Logic ---
    // We'll place the manager in the center and members in a circle around them.
    // If there are many members, we can use multiple concentric circles (orbits).

    // Constants for layout
    const CENTER_X = 50; // Percent
    const CENTER_Y = 50; // Percent
    const INITIAL_ORBIT_RADIUS = 22; // Start radius
    const ORBIT_RADIUS_STEP = 15; // Percent distance for each orbit ring
    const BASE_AVATAR_SIZE = 60; // px
    const MANAGER_AVATAR_SIZE = 120; // px

    // Helper to calculate position
    const calculatePosition = (index: number, total: number, orbitIndex: number = 0) => {
        const radius = INITIAL_ORBIT_RADIUS + (orbitIndex * ORBIT_RADIUS_STEP);
        // Add offset to avoid cardinal directions (top/bottom/left/right) if possible for better aesthetic
        const offsetAngle = (orbitIndex % 2 === 0) ? (Math.PI / total) : 0;
        const angleStep = (2 * Math.PI) / total;
        const angle = angleStep * index - (Math.PI / 2) + offsetAngle;

        // Convert to percentage offsets
        const x = CENTER_X + radius * Math.cos(angle) * 1.8; // Wider aspect ratio
        const y = CENTER_Y + radius * Math.sin(angle);

        return { x, y };
    };

    // Distribute members into orbits if there are too many
    const MAX_PER_ORBIT = 8;
    const orbits: TeamMember[][] = [];
    let remainingMembers = [...team];
    while (remainingMembers.length > 0) {
        orbits.push(remainingMembers.splice(0, MAX_PER_ORBIT));
    }
    // If we have just a few extra in the last orbit, maybe balance it? For now simple chunking.

    return (
        <Box sx={{
            width: '100%',
            height: 'calc(100vh - 100px)', // Adjust for header
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.0) 70%)',
            overflow: 'hidden', // Ensure Universe stays contained
        }}>

            {/* Manager (Sun) */}
            {manager && (
                <Box sx={{
                    position: 'absolute',
                    zIndex: 10,
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                    <Avatar
                        src={manager.profilePictureUrl}
                        alt={manager.firstName}
                        sx={{
                            width: MANAGER_AVATAR_SIZE,
                            height: MANAGER_AVATAR_SIZE,
                            boxShadow: '0 0 30px rgba(0,0,0,0.15)',
                            border: '6px solid white',
                        }}
                    />
                    <Box sx={{
                        mt: 2,
                        bgcolor: 'rgba(255,255,255,0.85)',
                        px: 2,
                        py: 1,
                        borderRadius: 4,
                        backdropFilter: 'blur(4px)',
                        textAlign: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1 }}>You</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Team Lead</Typography>
                    </Box>
                </Box>
            )}

            {/* Team Members (Planets) */}
            {orbits.map((orbitMembers, orbitIndex) => (
                orbitMembers.map((member, index) => {
                    const pos = calculatePosition(index, orbitMembers.length, orbitIndex);
                    const isHovered = hoveredMember?._id === member._id;

                    return (
                        <Box
                            key={member._id}
                            sx={{
                                position: 'absolute',
                                top: `${pos.y}%`,
                                left: `${pos.x}%`,
                                transform: 'translate(-50%, -50%)',
                                transition: 'all 0.5s ease-out',
                                zIndex: isHovered ? 20 : 5,
                                cursor: 'pointer',
                            }}
                            onMouseEnter={() => setHoveredMember(member)}
                            onMouseLeave={() => setHoveredMember(null)}
                        >
                            <Avatar
                                src={member.profilePictureUrl || '/static/images/avatar/default.jpg'}
                                alt={member.firstName}
                                sx={{
                                    width: isHovered ? 80 : BASE_AVATAR_SIZE,
                                    height: isHovered ? 80 : BASE_AVATAR_SIZE,
                                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.1)',
                                    border: isHovered ? `3px solid ${theme.palette.primary.main}` : '2px solid white',
                                }}
                            />
                            {/* Name Label under avatar if not hovered (hover shows card) */}
                            <Fade in={!isHovered}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        mt: 0.5,
                                        display: 'block',
                                        textAlign: 'center',
                                        bgcolor: 'rgba(255,255,255,0.8)',
                                        borderRadius: 1,
                                        px: 0.5,
                                        fontWeight: 'bold',
                                        backdropFilter: 'blur(4px)',
                                    }}
                                >
                                    {member.firstName}
                                </Typography>
                            </Fade>

                            {/* Hover Card */}
                            <Fade in={isHovered} timeout={200}>
                                <Card
                                    sx={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        mt: 1,
                                        minWidth: 200,
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                                        borderRadius: 2,
                                        overflow: 'visible',
                                        pointerEvents: 'none', // Prevent card from flickering mouse leave
                                    }}
                                >
                                    {/* Triangle Arrow */}
                                    <Box sx={{
                                        position: 'absolute',
                                        top: -8,
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: 0,
                                        height: 0,
                                        borderLeft: '8px solid transparent',
                                        borderRight: '8px solid transparent',
                                        borderBottom: '8px solid white',
                                    }} />

                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {member.firstName} {member.lastName}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            {member.position?.title || 'Team Member'}
                                        </Typography>

                                        <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            <Chip
                                                label={member.status}
                                                size="small"
                                                color={member.status === 'ACTIVE' ? 'success' : 'default'}
                                                variant="outlined"
                                            />
                                            <Chip
                                                label={member.department?.name || 'Department'}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </Box>

                                        <Typography variant="caption" display="block" sx={{ mt: 1.5, color: 'text.secondary' }}>
                                            {member.email}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Fade>
                        </Box>
                    );
                })
            ))}

        </Box>
    );
}
