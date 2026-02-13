import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, Slide, Box } from '@mui/material';

const NotificationContext = createContext();

// Stable transition component to prevent unnecessary remounts
const TransitionLeft = (props) => <Slide {...props} direction="left" />;

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'info', // 'error', 'warning', 'info', 'success'
        key: 0
    });

    const showNotification = useCallback((message, severity = 'info') => {
        setNotification({
            open: true,
            message,
            severity,
            key: Date.now()
        });
    }, []);

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setNotification((prev) => ({ ...prev, open: false }));
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                TransitionComponent={TransitionLeft}
                sx={{
                    // CRITICAL: Prevent the Snackbar container from blocking clicks to the theme toggle
                    pointerEvents: 'none',
                    zIndex: (theme) => theme.zIndex.snackbar
                }}
            >
                <Alert
                    onClose={handleClose}
                    severity={notification.severity}
                    sx={{
                        width: '100%',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: 3,
                        // Re-enable pointer events for the alert itself so links/close button work
                        pointerEvents: 'auto',
                        whiteSpace: 'pre-line',
                        '& .MuiAlert-message': { pb: 0.8 }
                    }}
                >
                    {notification.message}
                    {notification.open && (
                        <Box
                            key={notification.key}
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                width: '100%',
                                height: '3px',
                                bgcolor: 'rgba(0,0,0,0.1)',
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    height: '100%',
                                    width: '100%',
                                    bgcolor: 'currentColor',
                                    opacity: 0.7,
                                    animation: 'countdown 6s linear forwards',
                                },
                                '@keyframes countdown': {
                                    '0%': { width: '100%' },
                                    '100%': { width: '0%' }
                                }
                            }}
                        />
                    )}
                </Alert>
            </Snackbar>
        </NotificationContext.Provider>
    );
};
