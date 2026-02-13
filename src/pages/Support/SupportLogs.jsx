import { useState, useEffect } from 'react';

import {
    Typography, Box, FormControl, InputLabel, Select, MenuItem, Button,
    Paper, TextField, Alert, Container, CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { api } from '../../services/api';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNotification } from '../../contexts/NotificationContext';

export default function SupportLogs() {
    const { showNotification } = useNotification();
    const [incharge, setIncharge] = useState('');
    const [logData, setLogData] = useState('');

    const { data: incharges = [], isLoading: isLoadingIncharges, isError, error } = useQuery({
        queryKey: ['incharges'],
        queryFn: api.getIncharges
    });

    useEffect(() => {
        if (isError && error) {
            showNotification("Failed to load incharges: " + error.message, "error");
        }
    }, [isError, error, showNotification]);

    const mutation = useMutation({
        mutationFn: (data) => api.submitLog(data),
        onSuccess: (data) => {
            let message = data.message || "Support log submitted successfully!";
            let severity = "success";

            // If there are partial failures, append them to the message
            if (data.errors && data.errors.length > 0) {
                severity = "warning";
                const errorDetails = data.errors.map(err => {
                    const prefix = err.type ? `[${err.type}] ` : (err.segment ? `[Segment: ${err.segment}] ` : "");
                    return `• ${prefix}${err.message}`;
                }).join('\n');
                message += `\n\nIssues found:\n${errorDetails}`;
            }

            showNotification(message, severity);
            setLogData('');
            setIncharge('');
        },
        onError: (err) => {
            showNotification(err.message, "error");
        }
    });

    const handleSubmit = () => {
        if (!incharge || !logData) return;
        mutation.mutate({ inchargeId: incharge, logData });
    };

    return (
        <Box
            className="scroll-container"
            sx={{
                width: '100%',
                height: '100vh',
                overflowY: 'auto',
                backgroundColor: 'background.default',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                pt: 2,
                pb: 4,
                px: { xs: 2, md: 4 }
            }}
        >
            <Container maxWidth={false} sx={{ maxWidth: '800px' }}>
                <Paper
                    variant="outlined"
                    sx={{
                        p: { xs: 2, md: 4 },
                        borderRadius: 2,
                        boxShadow: (theme) => theme.palette.mode === 'light'
                            ? '0 4px 20px rgba(0,0,0,0.08)'
                            : '0 4px 20px rgba(0,0,0,0.4)',
                        backgroundColor: 'background.paper',
                    }}
                >
                    <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                            fontWeight: 'bold',
                            mb: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: 'text.primary'
                        }}
                    >
                        CAMS Support Logs Submission
                    </Typography>
                    <Alert
                        severity="info"
                        sx={{
                            mb: 3,
                            fontSize: '1rem',
                            borderRadius: 2,
                            '& .MuiAlert-icon': { fontSize: '1.5rem' }
                        }}
                    >
                        <strong>Reminder:</strong> Please use the new text update format for all submissions.
                    </Alert>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <FormControl fullWidth variant="outlined" disabled={isLoadingIncharges}>
                            <InputLabel id="incharge-label">
                                {isLoadingIncharges ? 'Loading Incharges...' : 'Responsible Incharge'}
                            </InputLabel>
                            <Select
                                labelId="incharge-label"
                                value={incharge}
                                label="Responsible Incharge"
                                onChange={(e) => setIncharge(e.target.value)}
                                sx={{ borderRadius: 2 }}
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: 300,
                                        },
                                    },
                                }}
                            >
                                <MenuItem value="" disabled>Select Incharge...</MenuItem>
                                {incharges.map((person) => (
                                    <MenuItem key={person.id} value={person.id} >
                                        {person.firstName} {person.lastName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Log Data"
                            multiline
                            rows={16}
                            fullWidth
                            placeholder="Paste your log data here..."
                            value={logData}
                            onChange={(e) => setLogData(e.target.value)}
                            variant="outlined"
                            disabled={mutation.isPending}
                            sx={{
                                '& .MuiInputBase-root': {
                                    fontSize: '1.05rem',
                                    fontFamily: 'monospace',
                                    backgroundColor: (theme) => theme.palette.mode === 'light' ? '#fafafa' : '#252525',
                                    borderRadius: 2
                                }
                            }}
                        />

                        <Button
                            variant="contained"
                            startIcon={mutation.isPending ? <CircularProgress size={20} color="inherit" /> : null}
                            size="large"
                            fullWidth
                            onClick={handleSubmit}
                            endIcon={!mutation.isPending && <SendIcon />}
                            disabled={mutation.isPending || !incharge || !logData}
                            sx={{
                                py: 2,
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                borderRadius: 2,
                                backgroundColor: 'success.main',
                                boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)',
                                '&:hover': {
                                    backgroundColor: 'success.dark',
                                    boxShadow: '0 6px 16px rgba(46, 125, 50, 0.3)',
                                },
                                textTransform: 'none'
                            }}
                        >
                            {mutation.isPending ? 'Submitting...' : 'Submit Log Data'}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}
