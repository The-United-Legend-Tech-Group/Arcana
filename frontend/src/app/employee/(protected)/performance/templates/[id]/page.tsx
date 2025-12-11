'use client';

import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import { useRouter, useParams } from 'next/navigation';
import TemplateForm from '../components/TemplateForm';
import { CreateAppraisalTemplateDto, Department, Position, AppraisalTemplate } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:50000';

export default function EditTemplatePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [template, setTemplate] = useState<AppraisalTemplate | null>(null);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const headers = { 'Authorization': `Bearer ${token}` };

                const [tmplRes, deptsRes, posRes] = await Promise.all([
                    fetch(`${API_URL}/performance/templates/${id}`, { headers, credentials: 'include' }),
                    fetch(`${API_URL}/organization-structure/departments`, { headers, credentials: 'include' }),
                    fetch(`${API_URL}/organization-structure/positions`, { headers, credentials: 'include' }),
                ]);

                if (tmplRes.ok) setTemplate(await tmplRes.json());
                if (deptsRes.ok) setDepartments(await deptsRes.json());
                if (posRes.ok) setPositions(await posRes.json());
            } catch (error) {
                console.error('Failed to fetch data', error);
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            fetchData();
        }
    }, [id]);

    const handleSubmit = async (data: CreateAppraisalTemplateDto) => {
        try {
            const response = await fetch(`${API_URL}/performance/templates/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
                body: JSON.stringify(data),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update template: ${response.status} ${response.statusText} - ${errorText}`);
            }

            router.push('/employee/performance/templates');
        } catch (error) {
            console.error('Failed to update template', error);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (!template) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h5">Template not found</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box mb={3}>
                <Typography variant="h4" component="h1">
                    Edit Appraisal Template
                </Typography>
            </Box>
            <TemplateForm
                initialData={template}
                departments={departments}
                positions={positions}
                onSubmit={handleSubmit}
                onCancel={() => router.push('/employee/performance/templates')}
            />
        </Container>
    );
}
