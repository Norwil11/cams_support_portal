import { useState, useEffect } from 'react';

import {
    Typography, Box, TextField, Button, Paper, Grid, Card, CardHeader, CardContent,
    Table, TableBody, TableCell, TableHead, TableRow, Chip, CircularProgress, Divider, TableContainer, Skeleton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import SavingsIcon from '@mui/icons-material/Savings';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import WarningIcon from '@mui/icons-material/Warning';
import { api } from '../../services/api';
import { useQuery } from '@tanstack/react-query';
import { useNotification } from '../../contexts/NotificationContext';

const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '-';
    // Ensure amount is a number before formatting
    const num = Number(amount);
    if (isNaN(num)) return amount; // Return original if not a number
    return '₱' + num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const StatusChip = ({ value, color = 'default' }) => (
    <Chip
        label={value}
        size="small"
        color={color}
        sx={{ fontWeight: 500 }}
    />
);

const RightCell = (props) => (
    <TableCell align="right" {...props} />
);


const HeaderTitle = ({ title, icon, color }) => (
    <Box sx={{
        bgcolor: color,
        color: 'white',
        p: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        borderRadius: '4px 4px 0 0'
    }}>
        {icon}
        <Typography variant="subtitle1" fontWeight="bold">{title}</Typography>
    </Box>
);

const FieldValue = ({ label, value, isStatus, isCurrency }) => (
    <Box>
        <Typography variant="caption" display="block" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
            {label}
        </Typography>
        {isStatus ? (
            <Chip
                label={value}
                color={value === 'Active' ? 'success' : 'default'}
                size="small"
                variant="outlined"
                sx={{
                    borderColor: value === 'Active' ? 'success.main' : 'grey.500',
                    color: value === 'Active' ? 'success.main' : 'text.primary',
                    fontWeight: 'bold',
                    bgcolor: value === 'Active' ? 'success.light' : 'transparent',
                    bgOpacity: 0.1
                }}
            />
        ) : (
            <Typography variant="body1" fontWeight="500">
                {isCurrency ? formatCurrency(value) : (value || '-')}
            </Typography>
        )}
    </Box>
);

export default function ClientTracker() {
    const { showNotification } = useNotification();
    const [refNo, setRefNo] = useState('');
    const [searchRefNo, setSearchRefNo] = useState(null);
    const CLIENT_REF_REGEX = /^[Bb]\d{4}-\d{7}$/;

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['clientTracker', searchRefNo],
        queryFn: () => api.getClientTracker(searchRefNo),
        enabled: !!searchRefNo
    });

    useEffect(() => {
        if (isError && error) {
            showNotification(error.message, 'error');
        }
    }, [isError, error, showNotification]);

    const handleSearch = () => {
        if (!refNo) return;
        const normalizedRefNo = refNo.trim();
        if (!CLIENT_REF_REGEX.test(normalizedRefNo)) {
            showNotification("Invalid client reference number format. (e.g., B0001-0000001)", "warning");
            return;
        }
        setSearchRefNo(normalizedRefNo);
    };

    return (
        <Box className="scroll-container" sx={{ height: '100%', overflowY: 'auto', p: 1 }}>
            <Typography variant="h5" color="primary" gutterBottom sx={{ borderBottom: '2px solid #1976d2', display: 'inline-block', mb: 2 }}>
                CLIENT INVESTIGATION TOOL
            </Typography>

            {/* Search Section */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        label="Client Reference Number"
                        placeholder="Enter client reference number..."
                        value={refNo}
                        onChange={(e) => setRefNo(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        sx={{ flexGrow: 1 }}
                        size="small"
                        disabled={isLoading}
                    />
                    <Button
                        variant="contained"
                        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                        onClick={handleSearch}
                        disabled={isLoading || !refNo}
                    >
                        {isLoading ? 'Searching...' : 'Search Record'}
                    </Button>
                </Box>
            </Paper>

            {isLoading ? (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={9}>
                        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                    </Grid>
                    <Grid item xs={12}>
                        <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
                    </Grid>
                </Grid>
            ) : data && data.client_info ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Grid container spacing={3}>
                        {/* Client Profile */}
                        <Grid item xs={12} md={9} sx={{ display: 'flex' }}>
                            <Paper variant="outlined" sx={{ borderRadius: 2, flex: 1 }}>
                                <HeaderTitle title="Client Profile" icon={<PersonIcon />} color="#2e7d32" />

                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ '& th': { fontWeight: 'bold', fontSize: '0.75rem', color: 'text.secondary' } }}>
                                                <TableCell>FULL NAME</TableCell>
                                                <TableCell>BRANCH</TableCell>
                                                <TableCell>BIRTHDATE</TableCell>
                                                <TableCell>STATUS</TableCell>
                                                <TableCell>CLOSE STATUS</TableCell>
                                                <TableCell>MEMBERSHIP DATE</TableCell>
                                                <TableCell>CLOSED ON</TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            <TableRow hover>
                                                <TableCell>{data.client_info["Name"] || '-'}</TableCell>
                                                <TableCell>{data.client_info["Branch"] || '-'}</TableCell>
                                                <TableCell>{data.client_info["Birthdate"] || '-'}</TableCell>
                                                <TableCell><Typography variant="body2" sx={{
                                                    color: data.client_info["Status"] === 'Active' ? 'success.main' : data.client_info["Status"] === 'Closed' ? 'error.main' : 'text.secondary',
                                                    fontWeight: 'bold'
                                                }}>{data.client_info["Status"] || '-'}</Typography></TableCell>
                                                <TableCell>{data.client_info["CloseStatus"] || '-'}</TableCell>
                                                <TableCell>{data.client_info["MembershipDate"] || '-'}</TableCell>
                                                <TableCell>{data.client_info["ClosedOn"] || '-'}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        </Grid>

                        {/* Savings Overview */}
                        <Grid item xs={12} md={3} sx={{ display: 'flex' }}>
                            <Paper variant="outlined" sx={{ borderRadius: 2, flex: 1 }}>
                                <HeaderTitle title="Savings Overview" icon={<SavingsIcon />} color="#1565c0" />

                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ '& th': { fontWeight: 'bold', fontSize: '0.75rem', color: 'text.secondary' } }}>
                                                <TableCell>CBU BALANCE</TableCell>
                                                <TableCell>LCBU</TableCell>
                                                <TableCell>STATUS</TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {data.savings && data.savings.length > 0 ? (
                                                <TableRow hover>
                                                    <TableCell>{formatCurrency(data.savings[0]?.cbu) ?? '-'}</TableCell>
                                                    <TableCell>{formatCurrency(data.savings[0]?.lcbu) ?? '-'}</TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{
                                                            color: data.savings[0]?.status === 'Active' ? 'success.main' : data.savings[0]?.status === 'Closed' ? 'error.main' : 'text.secondary',
                                                            fontWeight: 'bold'
                                                        }}>{data.savings[0]?.status || '-'}</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={3} sx={{ py: 3 }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            No savings data.
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Unclaimed Funds */}
                    <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                        <HeaderTitle title="Unclaimed Funds" icon={<CardGiftcardIcon />} color="#455a64" />
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ '& th': { fontWeight: 'bold', fontSize: '0.75rem', color: 'text.secondary' } }}>
                                        <TableCell>BRANCH</TableCell>
                                        <TableCell>CLIENT NAME</TableCell>
                                        <TableCell>AMOUNT</TableCell>
                                        <TableCell>DATE CLOSED</TableCell>
                                        <TableCell>CLAIMED?</TableCell>
                                        <TableCell>DATE CLAIMED</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.unclaimed && data.unclaimed.length > 0 ? (
                                        data.unclaimed.map((row, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>{row.branchNo ?? '-'}</TableCell>
                                                <TableCell>{row.clientName ?? '-'}</TableCell>
                                                <TableCell>{formatCurrency(row.unclaimed_amount) ?? '-'}</TableCell>
                                                <TableCell>{row.date_closed ?? '-'}</TableCell>
                                                <TableCell>{row.is_claimed === true ? 'Yes' : row.is_claimed === false ? 'No' : '-'}</TableCell>
                                                <TableCell>{row.date_claimed ?? '-'}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} sx={{ py: 3, pl: 2 }}>
                                                <Typography variant="body2" color="text.secondary">No Unclaimed Records</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>

                    {/* Bad Debt Records */}
                    <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                        <HeaderTitle title="Bad Debt Records" icon={<WarningIcon />} color="#d32f2f" />
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ '& th': { fontWeight: 'bold', fontSize: '0.75rem', color: 'text.secondary' } }}>
                                        <TableCell>BRANCH</TableCell>
                                        <TableCell>CLIENT NAME</TableCell>
                                        <TableCell>SAVINGS</TableCell>
                                        <TableCell>BAD DEBTS</TableCell>
                                        <TableCell>NETRISK</TableCell>
                                        <TableCell>CLOSED DATE</TableCell>
                                        <TableCell>PAID?</TableCell>
                                        <TableCell>DATE PAID</TableCell>
                                        <TableCell>STATUS</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.bad_debt && data.bad_debt.length > 0 ? (
                                        data.bad_debt.map((row, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>{row.branchNo ?? '-'}</TableCell>
                                                <TableCell>{row.clientName ?? '-'}</TableCell>
                                                <TableCell>{formatCurrency(row.savings) ?? '-'}</TableCell>
                                                <TableCell>{formatCurrency(row.bad_debts) ?? '-'}</TableCell>
                                                <TableCell>{formatCurrency(row.net_risk) ?? '-'}</TableCell>
                                                <TableCell>{row.date_closed ?? '-'}</TableCell>
                                                <TableCell>{row.is_paid === true ? 'Yes' : row.is_paid === false ? 'No' : '-'}</TableCell>
                                                <TableCell>{row.date_paid ?? '-'}</TableCell>
                                                <TableCell>{row.status ?? '-'}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={9} sx={{ py: 3, pl: 2 }}>
                                                <Typography variant="body2" color="text.secondary">No Bad Debt Records</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Box>
            ) : searchRefNo && !isLoading ? (
                <Typography color="error" sx={{ mt: 2 }}>Client profile not found.</Typography>
            ) : null}
        </Box>
    );
}
