import { useState, useEffect } from 'react';

import {
    Typography, Box, TextField, Button, Paper, TableContainer, Table, TableHead, TableRow, TableBody, TableCell,
    CircularProgress, Alert, Stack, Divider, useTheme, Skeleton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { api } from '../../services/api';
import { useQuery } from '@tanstack/react-query';
import { useNotification } from '../../contexts/NotificationContext';

export default function ContactSearch() {
    const { showNotification } = useNotification();
    const [contactNo, setContactNo] = useState('');
    const [searchNo, setSearchNo] = useState(null);

    const theme = useTheme();

    const { data: results = [], isLoading, isError, error } = useQuery({
        queryKey: ['contactSearch', searchNo],
        queryFn: () => api.searchContact(searchNo),
        enabled: !!searchNo
    });

    useEffect(() => {
        if (isError && error) {
            showNotification(error.message, 'error');
        }
    }, [isError, error, showNotification]);

    const handleSearch = () => {
        if (!contactNo) return;
        const normalizedNo = contactNo.trim();
        const PHONE_REGEX = /^\+?[0-9-]{2,20}$/;

        if (!PHONE_REGEX.test(normalizedNo)) {
            showNotification("Invalid format.\nPlease enter a valid contact number (at least 2 digits).", "warning");
            return;
        }

        setSearchNo(normalizedNo);
    };

    const handleReset = () => {
        setContactNo('');
        setSearchNo(null);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        // If it's an ISO string or has a space, take only the date part
        return dateStr.split(/[ T]/)[0];
    };

    const isDarkMode = theme.palette.mode === 'dark';
    const HEADER_BG = isDarkMode ? theme.palette.primary.dark : '#344955';

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', mb: 1, bgcolor: 'background.paper' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1rem', letterSpacing: '-0.01em', mb: 1.5 }}>
                    Search Client Contact No.
                </Typography>

                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', lg: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', lg: 'center' },
                    gap: 2
                }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
                        <TextField
                            label="Contact Number"
                            placeholder="Enter mobile or contact number..."
                            value={contactNo}
                            onChange={(e) => setContactNo(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            sx={{ minWidth: 250 }}
                            size="small"
                            disabled={isLoading}
                        />

                        <Button
                            variant="contained"
                            startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
                            onClick={handleSearch}
                            disabled={isLoading || !contactNo}
                            size="small"
                            sx={{ height: 35, textTransform: 'none', fontWeight: 'bold', px: 2 }}
                        >
                            {isLoading ? 'Searching...' : 'Find Number'}
                        </Button>
                    </Stack>

                    {searchNo && results.length > 0 && (
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box sx={{
                                px: 1.5,
                                py: 0.5,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                borderRadius: '8px',
                                border: '1px solid',
                                borderColor: 'divider',
                                bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : '#fdfdfd',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                            }}>
                                <VisibilityIcon sx={{ fontSize: '1rem', color: '#ed6c02' }} />
                                <Box>
                                    <Typography variant="caption" sx={{
                                        display: 'block',
                                        color: '#ed6c02',
                                        fontWeight: 800,
                                        fontSize: '0.65rem',
                                        lineHeight: 1,
                                        mb: 0.5,
                                        letterSpacing: '0.05em',
                                        opacity: 0.9
                                    }}>
                                        Matches found
                                    </Typography>
                                    <Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.9rem', lineHeight: 1 }}>
                                        {results.length}
                                    </Typography>
                                </Box>
                            </Box>
                            <Button
                                size="small"
                                color="error"
                                variant="outlined"
                                onClick={handleReset}
                                startIcon={<RestartAltIcon />}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    borderRadius: '10px',
                                    px: 1.5,
                                    height: 38,
                                    fontSize: '0.75rem',
                                    borderColor: 'divider',
                                    color: 'text.secondary',
                                    '&:hover': {
                                        borderColor: 'error.main',
                                        color: 'error.main',
                                        bgcolor: 'rgba(211, 47, 47, 0.04)'
                                    }
                                }}
                            >
                                Reset Search
                            </Button>
                        </Stack>
                    )}
                </Box>
            </Box>

            {isError && (
                <Alert severity="error" sx={{ mb: 2, mx: 2 }} onClose={handleReset}>
                    {error?.message || 'Search failed'}
                </Alert>
            )}

            <TableContainer component={Paper} sx={{ boxShadow: 3, flex: 1, minHeight: 0, overflowY: 'auto', borderRadius: '4px 4px 0 0' }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ backgroundColor: HEADER_BG, color: 'white', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.15)' }}>#</TableCell>
                            <TableCell sx={{ backgroundColor: HEADER_BG, color: 'white', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.15)' }}>BRANCH NO</TableCell>
                            <TableCell sx={{ backgroundColor: HEADER_BG, color: 'white', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.15)' }}>CLIENT REF NO</TableCell>
                            <TableCell sx={{ backgroundColor: HEADER_BG, color: 'white', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.15)' }}>FIRST NAME</TableCell>
                            <TableCell sx={{ backgroundColor: HEADER_BG, color: 'white', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.15)' }}>MIDDLE NAME</TableCell>
                            <TableCell sx={{ backgroundColor: HEADER_BG, color: 'white', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.15)' }}>LAST NAME</TableCell>
                            <TableCell sx={{ backgroundColor: HEADER_BG, color: 'white', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.15)' }}>BIRTHDATE</TableCell>
                            <TableCell sx={{ backgroundColor: HEADER_BG, color: 'white', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.15)' }}>MEMBERSHIP</TableCell>
                            <TableCell sx={{ backgroundColor: HEADER_BG, color: 'white', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.15)' }}>STATUS</TableCell>
                            <TableCell sx={{ backgroundColor: HEADER_BG, color: 'white', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.15)' }}>CLOSE STATUS</TableCell>
                            <TableCell sx={{ backgroundColor: HEADER_BG, color: 'white', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.15)' }}>CONTACT</TableCell>
                            <TableCell sx={{ backgroundColor: HEADER_BG, color: 'white', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.15)' }}>MOBILE</TableCell>
                            <TableCell sx={{ backgroundColor: HEADER_BG, color: 'white', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase' }}>LANDLINE</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    {Array.from({ length: 13 }).map((_, j) => (
                                        <TableCell key={j}><Skeleton variant="text" /></TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : results.length > 0 ? (
                            results.map((row, index) => (
                                <TableRow key={index} hover sx={{ '&:nth-of-type(even)': { bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#fafafa' } }}>
                                    <TableCell sx={{ fontSize: '0.75rem' }}>{index + 1}</TableCell>
                                    <TableCell sx={{ fontSize: '0.75rem' }}>{row.branchNo || '-'}</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>{row.clientRefNo || '-'}</TableCell>
                                    <TableCell sx={{ fontSize: '0.75rem' }}>{row.firstName || '-'}</TableCell>
                                    <TableCell sx={{ fontSize: '0.75rem' }}>{row.middleName || '-'}</TableCell>
                                    <TableCell sx={{ fontSize: '0.75rem' }}>{row.lastName || '-'}</TableCell>
                                    <TableCell sx={{ fontSize: '0.75rem' }}>{formatDate(row.birthdate) || '-'}</TableCell>
                                    <TableCell sx={{ fontSize: '0.75rem' }}>{formatDate(row.membershipDate) || '-'}</TableCell>
                                    <TableCell sx={{ fontSize: '0.75rem' }}>
                                        <Typography variant="body2" sx={{
                                            color: row.status === 'Active' ? 'success.main' : row.status === 'Closed' ? 'error.main' : 'text.secondary',
                                            fontWeight: 'bold',
                                            fontSize: '0.75rem'
                                        }}>{row.status || '-'}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '0.75rem' }}>{row.close_status || '-'}</TableCell>
                                    <TableCell sx={{ fontSize: '0.75rem' }}>{row.contactNo || '-'}</TableCell>
                                    <TableCell sx={{ fontSize: '0.75rem' }}>{row.mobileNo || '-'}</TableCell>
                                    <TableCell sx={{ fontSize: '0.75rem' }}>{row.landlineNo || '-'}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={13} align="center" sx={{ py: 3, fontSize: '0.8rem', color: 'text.secondary' }}>
                                    {searchNo
                                        ? 'No clients found matching the provided contact number.'
                                        : 'Enter a contact number and click "Find Number" to search.'
                                    }
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
