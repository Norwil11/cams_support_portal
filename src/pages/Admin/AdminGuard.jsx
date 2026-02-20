import React, { useState } from 'react';
import {
    Box, Paper, Typography, TextField, Button,
    InputAdornment, IconButton, Alert, useTheme
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const ACCESS_CODE = 'portal';

export default function AdminGuard({ children }) {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';

    // In-memory only — resets on every reload
    const [unlocked, setUnlocked] = useState(false);
    const [code, setCode] = useState('');
    const [showCode, setShowCode] = useState(false);
    const [error, setError] = useState(false);
    const [shake, setShake] = useState(false);

    if (unlocked) return children;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (code === ACCESS_CODE) {
            setUnlocked(true);
        } else {
            setError(true);
            setShake(true);
            setCode('');
            setTimeout(() => setShake(false), 600);
        }
    };

    return (
        <Box sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isDarkMode
                ? 'radial-gradient(ellipse at center, #1a237e22 0%, transparent 70%)'
                : 'radial-gradient(ellipse at center, #e3f2fd 0%, transparent 70%)',
        }}>
            <Paper
                elevation={0}
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    width: 340,
                    p: 4,
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2.5,
                    animation: shake ? 'shake 0.5s ease' : 'none',
                    '@keyframes shake': {
                        '0%, 100%': { transform: 'translateX(0)' },
                        '20%, 60%': { transform: 'translateX(-8px)' },
                        '40%, 80%': { transform: 'translateX(8px)' },
                    },
                }}
            >
                {/* Icon */}
                <Box sx={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(25,118,210,0.35)',
                }}>
                    <AdminPanelSettingsIcon sx={{ color: 'white', fontSize: '2rem' }} />
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        Admin Controls
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Enter the access code to continue
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ width: '100%', py: 0.5, fontSize: '0.78rem' }}>
                        Incorrect access code. Try again.
                    </Alert>
                )}

                <TextField
                    fullWidth
                    size="small"
                    label="Access Code"
                    type={showCode ? 'text' : 'password'}
                    value={code}
                    autoFocus
                    onChange={e => { setCode(e.target.value); setError(false); }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <LockIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setShowCode(v => !v)} edge="end">
                                    {showCode
                                        ? <VisibilityOffIcon sx={{ fontSize: '1rem' }} />
                                        : <VisibilityIcon sx={{ fontSize: '1rem' }} />
                                    }
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                        boxShadow: '0 4px 12px rgba(25,118,210,0.3)',
                        '&:hover': { boxShadow: '0 6px 16px rgba(25,118,210,0.45)' },
                    }}
                >
                    Unlock
                </Button>

                <Typography variant="caption" color="text.disabled" sx={{ mt: -1 }}>
                    Access code required on every visit.
                </Typography>
            </Paper>
        </Box>
    );
}
