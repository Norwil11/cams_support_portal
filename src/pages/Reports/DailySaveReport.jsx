import { useState, useEffect } from 'react';

import {
    Typography, Box, TextField, FormControl, InputLabel, Select, MenuItem, Button,
    Stack, Paper, TableContainer, Table, TableHead, TableRow, TableBody, TableCell,
    CircularProgress, Menu, Alert, useTheme, Divider, Skeleton, Chip
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { api } from '../../services/api';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ListAltIcon from '@mui/icons-material/ListAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useQuery } from '@tanstack/react-query';
import { useNotification } from '../../contexts/NotificationContext';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

// Color constants (can be adjusted via theme)
const ACTIVE_FILTER_COLOR = '#2cd2f0ff';

const FilterHeader = ({ label, column, filters, onFilterChange, data, sx = {} }) => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    const HEADER_BG = isDarkMode ? theme.palette.primary.dark : '#344955';
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleSelect = (value) => {
        onFilterChange(column)({ target: { value } });
        handleClose();
    };

    const uniqueValues = ['All', ...new Set((data || []).map(item => item[column]))].sort((a, b) => {
        if (a === 'All') return -1;
        if (b === 'All') return 1;
        if (typeof a === 'number' && typeof b === 'number') return a - b;
        return String(a).localeCompare(String(b));
    });

    const isFiltered = !!filters[column];

    return (
        <TableCell
            sx={{
                backgroundColor: HEADER_BG,
                color: 'white',
                fontWeight: 800,
                fontSize: '0.7rem',
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
                p: 1,
                ...sx
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        color: 'rgba(255,255,255,0.8)',
                        transform: 'translateY(-1px)',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    },
                    '&:active': { transform: 'translateY(0)' },
                    outline: 'none',
                    position: 'relative'
                }}
                onClick={handleClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        handleClick(e);
                    }
                }}
            >
                {label}
                {isFiltered && (
                    <Box
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: ACTIVE_FILTER_COLOR,
                            ml: 0.5,
                            border: '1px solid white'
                        }}
                    />
                )}
                <ArrowDropDownIcon fontSize="small" sx={{ ml: 0.5, color: isFiltered ? ACTIVE_FILTER_COLOR : 'rgba(255,255,255,0.7)' }} />
            </Box>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                {uniqueValues.map((val) => {
                    const isActive = (val === 'All' && !filters[column]) || (val !== 'All' && filters[column] === val);
                    return (
                        <MenuItem
                            key={val}
                            onClick={() => handleSelect(val === 'All' ? '' : val)}
                            sx={{
                                backgroundColor: isActive ? 'rgba(0, 51, 66, 0.08)' : 'transparent',
                                color: isActive ? HEADER_BG : 'inherit',
                                fontWeight: isActive ? 'bold' : 'normal',
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 51, 66, 0.12)'
                                }
                            }}
                        >
                            {val === 'All'
                                ? `All ${label.charAt(0).toUpperCase() + label.slice(1).toLowerCase()}`
                                : String(val).split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
                            }
                        </MenuItem>
                    );
                })}
            </Menu>
        </TableCell>
    );
}

const SummaryStat = ({ icon: Icon, label, count, color, onClick, active = false }) => {
    return (
        <Paper
            elevation={0}
            onClick={onClick}
            sx={{
                display: 'flex',
                alignItems: 'center',
                px: 1.2,
                py: 0.5,
                borderRadius: '8px',
                border: '1px solid',
                borderColor: active ? color : 'divider',
                bgcolor: 'background.paper',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                minWidth: 90,
                '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    borderColor: color,
                    bgcolor: onClick ? `${color}08` : 'background.paper'
                },
                '&:active': onClick ? { transform: 'translateY(0)' } : {}
            }}
        >
            <Icon sx={{ color: color, mr: 1, fontSize: '1rem' }} />
            <Box>
                <Typography
                    variant="caption"
                    sx={{
                        display: 'block',
                        color: 'text.secondary',
                        fontWeight: 700,
                        lineHeight: 1,
                        fontSize: '0.6rem',
                        mb: 0.2,
                        textTransform: 'uppercase'
                    }}
                >
                    {label}
                </Typography>
                <Typography sx={{ fontWeight: 800, lineHeight: 1, fontSize: '0.9rem', color: 'text.primary' }}>
                    {count}
                </Typography>
            </Box>
        </Paper>
    );
};

const selectMenuProps = {
    PaperProps: {
        sx: {
            borderRadius: 2,
            mt: 1,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            '& .MuiMenuItem-root': {
                fontSize: '0.85rem',
                fontWeight: 500,
                py: 1,
                '&:hover': {
                    backgroundColor: 'rgba(237, 108, 2, 0.08)',
                },
                '&.Mui-selected': {
                    backgroundColor: 'rgba(237, 108, 2, 0.12)',
                    fontWeight: 700,
                    '&:hover': {
                        backgroundColor: 'rgba(237, 108, 2, 0.16)',
                    }
                }
            }
        }
    }
};


export default function DailySaveReport() {
    const { showNotification } = useNotification();
    const [date, setDate] = useState(dayjs());
    const [operation, setOperation] = useState('');
    const [queryParams, setQueryParams] = useState(null);

    // Filter states
    const [filters, setFilters] = useState({
        division: '',
        handledBy: '',
        status: ''
    });
    const [filterByDuplicate, setFilterByDuplicate] = useState(false);

    const { data: reportData = [], isLoading, isError, error } = useQuery({
        queryKey: ['dailyReport', queryParams],
        queryFn: () => api.getDailyReport(queryParams),
        enabled: !!queryParams
    });

    useEffect(() => {
        if (isError && error) {
            showNotification(error.message, 'error');
        }
    }, [isError, error, showNotification]);

    const handleGenerate = () => {
        if (!date || !operation) return;
        setFilters({ division: '', handledBy: '', status: '' });
        setFilterByDuplicate(false);
        setQueryParams({ date: date.format('YYYY-MM-DD'), operation });
    };

    const handleFilterChange = (column) => (event) => {
        setFilters({
            ...filters,
            [column]: event.target.value
        });
    };

    const handleResetFilters = () => {
        setFilters({
            division: '',
            handledBy: '',
            status: ''
        });
        setFilterByDuplicate(false);
    };

    const filteredData = reportData.filter(row => {
        return (
            (filters.division === '' || row.division === filters.division) &&
            (filters.handledBy === '' || row.handledBy === filters.handledBy) &&
            (filters.status === '' || row.status === filters.status) &&
            (!filterByDuplicate || row.savedCount > 1)
        );
    });

    const isFiltered = Object.values(filters).some(v => v !== '') || filterByDuplicate;

    const filteredSaved = filteredData.filter(r => r.status === 'Saved Report').length;
    const filteredUnsaved = filteredData.filter(r => r.status !== 'Saved Report').length;
    const filteredDuplicates = filteredData.filter(r => r.savedCount > 1).length;

    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    const HEADER_BG = isDarkMode ? theme.palette.primary.dark : '#344955';

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider', mb: 1.5, bgcolor: 'background.paper' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1rem', letterSpacing: '-0.01em', mb: 1 }}>
                        Daily Save Report
                    </Typography>

                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', lg: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', lg: 'center' },
                        gap: 2
                    }}>
                        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
                            <DatePicker
                                label="Date"
                                value={date}
                                onChange={(newValue) => setDate(newValue)}
                                disabled={isLoading}
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                        sx: {
                                            minWidth: 160,
                                            '& .MuiInputBase-input': { fontWeight: 600, fontSize: '0.85rem' }
                                        }
                                    },
                                    popper: {
                                        sx: {
                                            '& .MuiPaper-root': {
                                                borderRadius: 2,
                                                mt: 1,
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                '& .MuiPickersDay-root': {
                                                    fontWeight: 500,
                                                    '&:hover': { backgroundColor: 'rgba(237, 108, 2, 0.08)' },
                                                    '&.Mui-selected': {
                                                        backgroundColor: '#ed6c02 !important',
                                                        '&:hover': { backgroundColor: '#e65100 !important' }
                                                    }
                                                },
                                                '& .MuiPickersYear-yearButton.Mui-selected': {
                                                    backgroundColor: '#ed6c02 !important'
                                                }
                                            }
                                        }
                                    }
                                }}
                            />

                            <FormControl size="small" sx={{ minWidth: 160 }}>
                                <InputLabel>Operation</InputLabel>
                                <Select
                                    value={operation}
                                    label="Operation"
                                    onChange={(e) => setOperation(e.target.value)}
                                    disabled={isLoading}
                                    size="small"
                                    MenuProps={selectMenuProps}
                                    sx={{ fontWeight: 600, fontSize: '0.85rem' }}
                                >
                                    <MenuItem value="LUZON I">LUZON I</MenuItem>
                                    <MenuItem value="LUZON II">LUZON II</MenuItem>
                                    <MenuItem value="VISAYAS I">VISAYAS I</MenuItem>
                                    <MenuItem value="VISAYAS II">VISAYAS II</MenuItem>
                                    <MenuItem value="MINDANAO I">MINDANAO I</MenuItem>
                                    <MenuItem value="MINDANAO II">MINDANAO II</MenuItem>
                                </Select>
                            </FormControl>

                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleGenerate}
                                disabled={isLoading || !date || !operation}
                                size="small"
                                sx={{ height: 35, textTransform: 'none', fontWeight: 'bold', px: 2 }}
                            >
                                {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Generate'}
                            </Button>
                        </Stack>

                        {reportData.length > 0 && (
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                                <SummaryStat
                                    icon={ListAltIcon}
                                    label="Total"
                                    count={reportData.length}
                                    color="#1976d2"
                                />
                                <SummaryStat
                                    icon={VisibilityIcon}
                                    label="Visible"
                                    count={filteredData.length}
                                    color="#666666"
                                />
                                <SummaryStat
                                    icon={CheckCircleIcon}
                                    label="Saved"
                                    count={filteredSaved}
                                    color="#2e7d32"
                                />
                                <SummaryStat
                                    icon={ErrorOutlineIcon}
                                    label="Not Saved"
                                    count={filteredUnsaved}
                                    color="#ed6c02"
                                />
                                {filteredDuplicates > 0 && (
                                    <SummaryStat
                                        icon={ErrorOutlineIcon}
                                        label="Duplicate"
                                        count={filteredDuplicates}
                                        color="#d32f2f"
                                        onClick={() => setFilterByDuplicate(!filterByDuplicate)}
                                        active={filterByDuplicate}
                                    />
                                )}
                                {isFiltered && (
                                    <Chip
                                        icon={<RestartAltIcon style={{ color: 'white', fontSize: '1rem' }} />}
                                        label="RESET"
                                        onClick={handleResetFilters}
                                        sx={{
                                            bgcolor: '#d32f2f',
                                            color: 'white',
                                            fontWeight: 900,
                                            fontSize: '0.6rem',
                                            height: 28,
                                            borderRadius: '6px',
                                            '&:hover': { bgcolor: '#b71c1c' },
                                            boxShadow: '0 1px 4px rgba(211, 47, 47, 0.3)'
                                        }}
                                    />
                                )}
                            </Stack>
                        )}
                    </Box>
                </Box>

                <TableContainer component={Paper} sx={{ boxShadow: 3, flex: 1, minHeight: 0, overflowY: 'auto', borderRadius: '4px 4px 0 0' }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ backgroundColor: HEADER_BG, color: 'white', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.15)' }}>BRANCH CODE</TableCell>
                                <TableCell sx={{ backgroundColor: HEADER_BG, color: 'white', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.15)' }}>BRANCH NAME</TableCell>
                                <TableCell sx={{ backgroundColor: HEADER_BG, color: 'white', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.15)' }}>AREA</TableCell>
                                <TableCell sx={{ backgroundColor: HEADER_BG, color: 'white', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.15)' }}>REGION</TableCell>
                                <FilterHeader
                                    label="DIVISION"
                                    column="division"
                                    filters={filters}
                                    onFilterChange={handleFilterChange}
                                    data={reportData}
                                    sx={{ fontSize: '0.7rem', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.15)' }}
                                />
                                <TableCell sx={{ backgroundColor: HEADER_BG, color: 'white', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.15)' }}>OPERATION</TableCell>
                                <FilterHeader
                                    label="INCHARGE"
                                    column="handledBy"
                                    filters={filters}
                                    onFilterChange={handleFilterChange}
                                    data={reportData}
                                    sx={{ fontSize: '0.7rem', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.15)' }}
                                />
                                <FilterHeader
                                    label="STATUS"
                                    column="status"
                                    filters={filters}
                                    onFilterChange={handleFilterChange}
                                    data={reportData}
                                    sx={{ fontSize: '0.7rem', textTransform: 'uppercase' }}
                                />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        {Array.from({ length: 8 }).map((_, j) => (
                                            <TableCell key={j}><Skeleton variant="text" /></TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : filteredData.length > 0 ? (
                                filteredData.map((row, index) => (
                                    <TableRow key={index} hover sx={{ '&:nth-of-type(even)': { bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#fafafa' } }}>
                                        <TableCell sx={{ fontSize: '0.75rem' }}>{row.branchCode}</TableCell>
                                        <TableCell sx={{ fontSize: '0.75rem' }}>{row.branchName}</TableCell>
                                        <TableCell sx={{ fontSize: '0.75rem' }}>{row.area}</TableCell>
                                        <TableCell sx={{ fontSize: '0.75rem' }}>{row.region}</TableCell>
                                        <TableCell sx={{ fontSize: '0.75rem' }}>{row.division}</TableCell>
                                        <TableCell sx={{ fontSize: '0.75rem' }}>{row.operation}</TableCell>
                                        <TableCell sx={{ fontSize: '0.75rem' }}>{row.handledBy}</TableCell>
                                        <TableCell sx={{
                                            color: row.status === 'Saved Report' ? 'success.main' : 'error.main',
                                            fontWeight: 600,
                                            fontSize: '0.75rem'
                                        }}>
                                            {row.status}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                        {queryParams?.date ? 'No data found for the selected filters.' : 'Select filters and click Generate.'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </LocalizationProvider>
    );
}
