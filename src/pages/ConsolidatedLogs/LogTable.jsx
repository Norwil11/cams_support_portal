import React, { useMemo, useState } from 'react';
import {
    Box, Typography, Paper, CircularProgress, Alert, Chip, Tooltip, Stack, MenuItem,
    Select, Divider, useTheme, TextField, TablePagination, InputAdornment, IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CircleIcon from '@mui/icons-material/Circle';
import ListAltIcon from '@mui/icons-material/ListAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';

/**
 * Reusable LogTable component for displaying logs from any support table.
 * It automatically formats columns based on the data provided or a given schema.
 */
export default function LogTable({ title, type, data = [], isLoading, isError, error }) {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    const queryClient = useQueryClient();
    const { showNotification } = useNotification();

    // Filter & Pagination State
    const [statusFilter, setStatusFilter] = useState('All');
    const [inchargeFilter, setInchargeFilter] = useState('All');
    const [searchText, setSearchText] = useState('');
    const [paginationModel, setPaginationModel] = useState({
        pageSize: 25,
        page: 0,
    });

    // Inline Editing State (Standard Table Replacement)
    const [editCell, setEditCell] = useState(null); // { id, field }

    // Memoized Filtering Logic (Status + Incharge + Search)
    const filteredData = useMemo(() => {
        return data.filter(row => {
            const matchesStatus = statusFilter === 'All' || row.status === statusFilter;
            const matchesIncharge = inchargeFilter === 'All' || row.responsible_incharge === inchargeFilter;

            if (!matchesStatus || !matchesIncharge) return false;

            if (!searchText) return true;

            // Search across all string/number fields
            const searchTerm = searchText.toLowerCase();
            return Object.values(row).some(val =>
                val && val.toString().toLowerCase().includes(searchTerm)
            );
        });
    }, [data, statusFilter, inchargeFilter, searchText]);

    const isFiltered = statusFilter !== 'All' || inchargeFilter !== 'All' || searchText !== '';

    // Paginated Data for standard Table
    const paginatedData = useMemo(() => {
        const start = paginationModel.page * paginationModel.pageSize;
        return filteredData.slice(start, start + paginationModel.pageSize);
    }, [filteredData, paginationModel]);

    // Summary Statistics for the bar - Use filtered data for counts
    const total = data.length;
    const visibleCount = filteredData.length;
    const pendingCount = filteredData.filter(r => r.status === 'Pending').length;
    const doneCount = filteredData.filter(r => r.status === 'Done').length;
    const updateCount = filteredData.filter(r => r.status === 'Need to update' || !r.status).length;

    // Mutation for real-time updates
    const updateMutation = useMutation({
        mutationFn: ({ id, field, value }) => api.updateLog(type, id, { [field]: value }),
        onSuccess: (data, variables) => {
            if (variables.field === 'status') {
                showNotification(`Log #${variables.id} status updated to ${variables.value.toUpperCase()}!`, 'success');
            } else {
                showNotification(`Successfully updated ${variables.field} for Log #${variables.id}!`, 'success');
            }
            // Force refresh to update 'updated_at' and other fields
            const queryKey = type === 'daily-concerns' ? 'dailyCamsLogs' : `${type.replace(/-./g, x => x[1].toUpperCase())}Logs`;
            queryClient.invalidateQueries({ queryKey: [queryKey] });
        },
        onError: (err) => {
            console.error('Update Error:', err);
            showNotification(`Failed to save: ${err.message}`, 'error');
            const queryKey = type === 'daily-concerns' ? 'dailyCamsLogs' : `${type.replace(/-./g, x => x[1].toUpperCase())}Logs`;
            queryClient.invalidateQueries({ queryKey: [queryKey] });
        }
    });

    // Memoized distinct values for filtering
    const distinctIncharges = useMemo(() => {
        const values = data
            .map(r => r.responsible_incharge)
            .filter(v => v && v.toString().trim() !== '')
            .map(v => v.toString().trim());
        return [...new Set(values)].sort();
    }, [data]);

    const distinctStatuses = ['Pending', 'Done', 'Need to update'];

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (isError) {
        return (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                Failed to load logs: {error?.message || "Unknown error"}
            </Alert>
        );
    }

    // Auto-generate and reorder columns
    const columns = data.length > 0 ? (() => {
        const hierarchyKeys = ['branch_name', 'area', 'region', 'division', 'operation'];
        const allKeys = Object.keys(data[0]).filter(k => k !== 'incharge_id');

        // Logic to place hierarchy keys right after branch_code
        let reorderedKeys = [...allKeys];
        const bcIdx = reorderedKeys.indexOf('branch_code');
        if (bcIdx !== -1) {
            // Remove them if they exist elsewhere
            reorderedKeys = reorderedKeys.filter(k => !hierarchyKeys.includes(k));
            // Find branch_code again in the filtered list and insert hierarchy after it
            const newBcIdx = reorderedKeys.indexOf('branch_code');
            reorderedKeys.splice(newBcIdx + 1, 0, ...hierarchyKeys);
        }

        return reorderedKeys.map(key => {
            const column = {
                field: key,
                headerName: key.replace(/_/g, ' ').toUpperCase(),
                flex: ['remarks', 'concern_details', 'reason_for_reopening', 'concern_issue', 'delay_cause'].includes(key) ? 2.5 : 1,
                minWidth: key === 'id' ? 60 :
                    key === 'branch_code' ? 120 :
                        key.length > 15 ? 200 : 160,
                width: key === 'id' ? 70 : key === 'branch_code' ? 120 : undefined,
                align: 'center',
                headerAlign: 'center',
                sortable: false,
                editable: key === 'delay_cause' || key === 'status',
                renderHeader: (params) => {
                    const isEditable = key === 'delay_cause' || key === 'status';
                    const isFilterable = ['status', 'responsible_incharge'].includes(key);
                    const isText = ['corporate_email', 'staff_name', 'remarks', 'concern_details', 'reason_for_reopening', 'concern_issue', 'delay_cause', 'branch_name', 'area', 'region', 'division', 'operation', 'responsible_incharge'].includes(key);

                    if (isFilterable) {
                        const filterValue = key === 'status' ? statusFilter : inchargeFilter;
                        const setFilter = key === 'status' ? setStatusFilter : setInchargeFilter;
                        const options = key === 'status' ? distinctStatuses : distinctIncharges;
                        const allLabel = key === 'status' ? 'All Status' : 'All Incharge';

                        return (
                            <Select
                                value={filterValue}
                                onChange={(e) => setFilter(e.target.value)}
                                variant="standard"
                                disableUnderline
                                IconComponent={ArrowDropDownIcon}
                                renderValue={() => key.replace(/_/g, ' ').toUpperCase()}
                                sx={{
                                    color: 'white',
                                    fontSize: '0.7rem',
                                    fontWeight: 800,
                                    width: '100%',
                                    '& .MuiSelect-select': {
                                        py: 0,
                                        pr: '18px !important',
                                        display: 'flex',
                                        alignItems: 'center',
                                        textTransform: 'uppercase',
                                        lineHeight: 1
                                    },
                                    '& .MuiSelect-icon': {
                                        color: 'white',
                                        right: -2
                                    }
                                }}
                                MenuProps={{
                                    PaperProps: {
                                        sx: {
                                            mt: 1,
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                            '& .MuiMenuItem-root': {
                                                fontSize: '0.75rem',
                                                py: 1,
                                                '&.Mui-selected': {
                                                    bgcolor: '#1976d2', // Match image blue
                                                    color: 'white',
                                                    fontWeight: 700,
                                                    '&:hover': { bgcolor: '#1565c0' }
                                                }
                                            }
                                        }
                                    }
                                }}
                            >
                                <MenuItem value="All" sx={{ fontWeight: 700 }}>{allLabel}</MenuItem>
                                {options.map(opt => (
                                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                ))}
                            </Select>
                        );
                    }

                    return (
                        <Tooltip
                            title={isEditable ? "Double-click a cell below to edit" : (isFilterable ? "Click the menu icon to filter" : "")}
                            arrow
                            slotProps={isEditable ? { popper: { sx: { pointerEvents: 'none' } } } : {}}
                        >
                            <Stack
                                direction="row"
                                spacing={0.8}
                                alignItems="center"
                                justifyContent={key === 'reason' ? "space-between" : (isText ? "flex-start" : "center")}
                                sx={{ width: '100%', cursor: isEditable ? 'help' : 'default', pl: isText ? 1.5 : 0, pr: key === 'reason' ? 1 : 0 }}
                            >
                                <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.7rem', color: 'inherit', letterSpacing: '0.02em' }}>
                                    {key.replace(/_/g, ' ').toUpperCase()}
                                </Typography>
                                {key === 'delay_cause' && (
                                    <EditIcon sx={{ fontSize: '0.85rem', color: 'inherit', opacity: 0.8, ml: 0.8 }} />
                                )}
                            </Stack>
                        </Tooltip>
                    );
                },
                renderCell: (params) => {
                    // Bold Row Sequence for ID
                    if (key === 'id') {
                        const rowIndex = params.api.getRowIndexRelativeToVisibleRows(params.id);
                        const sequentialNumber = (paginationModel.page * paginationModel.pageSize) + rowIndex + 1;
                        return <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.72rem' }}>{sequentialNumber}</Typography>;
                    }

                    const value = params.value;
                    const isEditable = key === 'delay_cause' || key === 'status';
                    if ((value === null || value === undefined) && !isEditable) return '';

                    // Toned down Branch Code
                    if (key === 'branch_code') {
                        return <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.72rem' }}>{value}</Typography>;
                    }

                    // Status Chips - Updated for ENUM labels
                    if (key === 'status') {
                        const statusVal = String(value);
                        let chipColor = 'default';
                        let chipLabel = statusVal;

                        if (statusVal === 'Done') chipColor = 'success';
                        else if (statusVal === 'Pending') chipColor = 'warning';
                        else if (statusVal === 'Need to update') chipColor = 'error';

                        return (
                            <Tooltip
                                title="Double-click to edit"
                                arrow
                                placement="top"
                                slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                            >
                                <Box sx={{ display: 'inline-flex' }}>
                                    <Chip
                                        label={chipLabel}
                                        size="small"
                                        color={chipColor}
                                        variant="filled"
                                        sx={{
                                            fontWeight: 700,
                                            fontSize: '0.65rem',
                                            height: 22,
                                            px: 1,
                                            textTransform: 'none',
                                            cursor: 'pointer'
                                        }}
                                    />
                                </Box>
                            </Tooltip>
                        );
                    }

                    // Tooltip for long text, including Reason (which is now editable as update_reason)
                    if (['remarks', 'concern_details', 'reason_for_reopening', 'concern_issue', 'delay_cause', 'corporate_email', 'staff_name', 'concerning_staff'].includes(key)) {
                        const isEmpty = !value || value.toString().trim() === '';
                        const isEditable = key === 'delay_cause';

                        return (
                            <Tooltip
                                title={isEditable ? (isEmpty ? "Double-click to add " + key.replace(/_/g, ' ') : "Double-click to edit") : (isEmpty ? "" : value)}
                                arrow
                                placement="top"
                                disableInteractive={isEditable}
                                slotProps={isEditable ? { popper: { sx: { pointerEvents: 'none' } } } : {}}
                            >
                                <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="space-between" sx={{
                                    width: '100%',
                                    px: 1,
                                    cursor: isEditable ? 'pointer' : 'default',
                                    '&:hover .edit-icon-hover': { opacity: 1 }
                                }}>
                                    <Typography
                                        variant="body2"
                                        noWrap
                                        sx={{
                                            flex: 1,
                                            maxWidth: 'calc(100% - 20px)',
                                            color: isEmpty ? 'text.disabled' : 'text.primary',
                                            fontSize: '0.72rem',
                                            opacity: isEmpty ? 0.6 : 1,
                                            fontWeight: (isEditable && !isEmpty) ? 500 : 400
                                        }}
                                    >
                                        {isEmpty ? ` ` : value}
                                    </Typography>
                                    {isEditable && (
                                        <EditIcon
                                            className="edit-icon-hover"
                                            sx={{
                                                fontSize: '0.7rem',
                                                color: 'primary.main',
                                                opacity: 0,
                                                transition: 'opacity 0.2s',
                                                ml: 0.5
                                            }}
                                        />
                                    )}
                                </Stack>
                            </Tooltip>
                        );
                    }

                    // Date/Timestamp Formatting
                    if (['time_log', 'created_at', 'updated_at'].includes(key) && value) {
                        return (
                            <Typography variant="body2" sx={{ fontSize: '0.72rem', px: 1, textAlign: 'center' }}>
                                {new Date(value).toLocaleString('en-US', {
                                    month: 'short', day: 'numeric', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                })}
                            </Typography>
                        );
                    }

                    // Default Tooltip Truncation for all other text cells
                    return (
                        <Tooltip
                            title={value}
                            arrow
                            placement="top"
                        >
                            <Typography variant="body2" noWrap sx={{ fontSize: '0.72rem', px: 1, width: '100%', textAlign: column.align }}>
                                {value}
                            </Typography>
                        </Tooltip>
                    );
                }
            };

            const isText = ['corporate_email', 'staff_name', 'remarks', 'concern_details', 'reason_for_reopening', 'concern_issue', 'delay_cause', 'concerning_staff', 'client_name', 'group_name', 'name_of_mfo', 'branch_name', 'area', 'region', 'division', 'operation', 'responsible_incharge'].includes(key);
            column.align = isText ? 'left' : 'center';
            column.headerAlign = isText ? 'left' : 'center';

            // Filtering Logic
            if (['status', 'responsible_incharge'].includes(key)) {
                column.type = 'singleSelect';
                column.valueOptions = key === 'status' ? distinctStatuses : distinctIncharges;
            }

            // For status, allow single selection with new ENUM values
            // REQUIREMENT: Limit dropdown to only 'Pending' and 'Done'
            if (key === 'status') {
                column.type = 'singleSelect';

                // Premium Enhancement: Custom Edit Cell with Color Dots
                column.renderEditCell = (params) => {
                    const { id, value, field, api } = params;

                    const handleChange = (event) => {
                        const newValue = event.target.value;
                        if (newValue !== value) {
                            api.setEditCellValue({ id, field, value: newValue });
                        }
                        // Close the edit mode immediately after selection for a smoother feel
                        setTimeout(() => {
                            api.stopCellEditMode({ id, field });
                        }, 0);
                    };

                    return (
                        <Select
                            value={value || ''}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                            variant="outlined"
                            autoOpen
                            sx={{
                                '& .MuiSelect-select': {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    py: 0.5,
                                    fontSize: '0.75rem'
                                }
                            }}
                        >
                            <MenuItem value="Pending" sx={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <CircleIcon sx={{ fontSize: '0.6rem', color: '#ed6c02' }} />
                                Pending
                            </MenuItem>
                            <MenuItem value="Done" sx={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <CircleIcon sx={{ fontSize: '0.6rem', color: '#2e7d32' }} />
                                Done
                            </MenuItem>
                        </Select>
                    );
                };
            }

            return column;
        });
    })() : [];

    // Helper component for summary items
    const StatBox = ({ label, value, icon: Icon, color }) => (
        <Paper
            elevation={0}
            sx={{
                px: 1.2,
                py: 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                borderRadius: '8px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                transition: 'all 0.2s ease',
                minWidth: 90,
                '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    borderColor: color
                }
            }}
        >
            <Icon sx={{ fontSize: '1rem', color: color }} />
            <Box>
                <Typography variant="caption" sx={{
                    display: 'block',
                    color: 'text.secondary',
                    fontWeight: 700,
                    fontSize: '0.6rem',
                    lineHeight: 1,
                    mb: 0.2,
                    textTransform: 'uppercase'
                }}>
                    {label}
                </Typography>
                <Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.9rem', lineHeight: 1 }}>
                    {value}
                </Typography>
            </Box>
        </Paper>
    );

    return (
        <Box sx={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider', mb: 1.5, bgcolor: 'background.paper' }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', lg: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', lg: 'center' },
                    gap: 1.5
                }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1rem', letterSpacing: '-0.01em' }}>
                        {title}
                    </Typography>

                    <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" useFlexGap>
                        <StatBox label="TOTAL" value={total} icon={ListAltIcon} color="#1976d2" />
                        <StatBox label="VISIBLE" value={visibleCount} icon={VisibilityIcon} color="#455a64" />
                        <StatBox label="PENDING" value={pendingCount} icon={PendingActionsIcon} color="#ed6c02" />
                        <StatBox label="DONE" value={doneCount} icon={CheckCircleIcon} color="#2e7d32" />
                        <StatBox label="UPDATE" value={updateCount} icon={ErrorOutlineIcon} color="#d32f2f" />

                        {isFiltered && (
                            <Chip
                                icon={<RestartAltIcon style={{ color: 'white', fontSize: '1rem' }} />}
                                label="RESET"
                                onClick={() => {
                                    setStatusFilter('All');
                                    setInchargeFilter('All');
                                    setSearchText('');
                                }}
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
                </Box>
            </Box>

            {/* Final Robust Control Bar: Search & Pagination Outside DataGrid */}
            <Box sx={{
                p: '10px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
                border: '1px solid',
                borderColor: 'divider',
                borderBottom: 'none',
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                flexWrap: { xs: 'wrap', md: 'nowrap' },
                gap: 3,
                boxShadow: '0 -4px 20px rgba(0,0,0,0.02)'
            }}>
                <TextField
                    placeholder="Search all columns..."
                    size="small"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ fontSize: '1.1rem', color: isDarkMode ? 'primary.light' : 'primary.main', opacity: 0.7 }} />
                            </InputAdornment>
                        ),
                        endAdornment: searchText && (
                            <InputAdornment position="end">
                                <IconButton
                                    size="small"
                                    onClick={() => setSearchText('')}
                                    sx={{ p: 0.5, color: 'text.secondary' }}
                                >
                                    <ClearIcon sx={{ fontSize: '1rem' }} />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        width: { xs: '100%', md: 320 },
                        '& .MuiInputBase-root': {
                            height: 38,
                            fontSize: '0.8rem', // Finalized font size
                            bgcolor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
                            borderRadius: '10px',
                            transition: 'all 0.2s ease',
                            border: '1px solid transparent',
                            '&:hover': {
                                bgcolor: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)',
                            },
                            '&.Mui-focused': {
                                bgcolor: 'background.paper',
                                boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)',
                                borderColor: 'primary.main'
                            }
                        },
                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
                    }}
                />

                <TablePagination
                    component="div"
                    count={filteredData.length}
                    page={paginationModel.page}
                    onPageChange={(_, newPage) => setPaginationModel(prev => ({ ...prev, page: newPage }))}
                    rowsPerPage={paginationModel.pageSize}
                    onRowsPerPageChange={(e) => setPaginationModel({ page: 0, pageSize: parseInt(e.target.value, 10) })}
                    rowsPerPageOptions={[10, 25, 50, 100, 500, 1000]}
                    sx={{
                        '& .MuiTablePagination-toolbar': { minHeight: 40, p: 0 },
                        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                            fontSize: '0.75rem',
                            fontWeight: 600
                        },
                        '& .MuiTablePagination-select': {
                            fontSize: '0.75rem',
                            fontWeight: 700
                        },
                        border: 'none'
                    }}
                    SelectProps={{
                        MenuProps: {
                            PaperProps: {
                                sx: {
                                    '& .MuiMenuItem-root': {
                                        fontSize: '0.75rem',
                                        fontWeight: 600
                                    }
                                }
                            }
                        }
                    }}
                />
            </Box>

            <Paper sx={{
                flexGrow: 1,
                minHeight: 0,
                width: '100%',
                borderRadius: '0 0 12px 12px', // Match bottom only, top is connected to control bar
                overflow: 'hidden',
                boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <TableContainer sx={{
                    flexGrow: 1,
                    overflow: 'auto',
                    // Aggressive cross-browser scrollbar hiding
                    '&::-webkit-scrollbar': { display: 'none' },
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                {columns.map((col) => (
                                    <TableCell
                                        key={col.field}
                                        align={col.headerAlign || 'center'}
                                        sx={{
                                            backgroundColor: isDarkMode ? theme.palette.primary.dark : '#344955',
                                            color: 'white',
                                            fontSize: '0.7rem',
                                            fontWeight: 800,
                                            borderRight: '1px solid rgba(255, 255, 255, 0.15)',
                                            whiteSpace: 'nowrap',
                                            py: 1,
                                            px: col.field === 'id' ? 1 : 2,
                                            minWidth: col.minWidth || 100,
                                            '&:last-child': { borderRight: 'none' }
                                        }}
                                    >
                                        {col.renderHeader ? col.renderHeader() : col.headerName}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedData.map((row, rowIndex) => (
                                <TableRow
                                    key={row.id}
                                    sx={{
                                        '&:nth-of-type(even)': {
                                            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#fafafa',
                                        },
                                        '&:hover': {
                                            backgroundColor: theme.palette.action.hover
                                        }
                                    }}
                                >
                                    {columns.map((col) => {
                                        const isEditing = editCell?.id === row.id && editCell?.field === col.field;
                                        const value = row[col.field];

                                        return (
                                            <TableCell
                                                key={col.field}
                                                align={col.align || 'center'}
                                                onDoubleClick={() => {
                                                    if (col.editable) {
                                                        setEditCell({ id: row.id, field: col.field });
                                                    }
                                                }}
                                                sx={{
                                                    fontSize: '0.75rem',
                                                    borderBottom: '1px solid',
                                                    borderColor: theme.palette.divider,
                                                    py: 0.5,
                                                    px: col.field === 'id' ? 1 : 2,
                                                    whiteSpace: 'nowrap',
                                                    maxWidth: col.width || 300,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    cursor: col.editable ? 'pointer' : 'default',
                                                    ...(col.editable && {
                                                        '&:hover': {
                                                            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(25, 118, 210, 0.04)',
                                                            boxShadow: `inset 0 0 0 1px ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(25, 118, 210, 0.1)'}`,
                                                        }
                                                    })
                                                }}
                                            >
                                                {isEditing ? (
                                                    // Render custom editor or standard Select/TextField
                                                    col.renderEditCell ? col.renderEditCell({
                                                        id: row.id,
                                                        field: col.field,
                                                        value: value,
                                                        api: {
                                                            setEditCellValue: ({ value }) => {
                                                                // Handle update
                                                                updateMutation.mutate({ id: row.id, field: col.field, value });
                                                            },
                                                            stopCellEditMode: () => setEditCell(null)
                                                        }
                                                    }) : (
                                                        <TextField
                                                            autoFocus
                                                            fullWidth
                                                            size="small"
                                                            defaultValue={value}
                                                            onBlur={(e) => {
                                                                const newValue = e.target.value?.trim() || "";
                                                                const oldValue = value?.trim() || "";
                                                                if (newValue !== oldValue) {
                                                                    updateMutation.mutate({ id: row.id, field: col.field, value: e.target.value });
                                                                }
                                                                setEditCell(null);
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    const newValue = e.target.value?.trim() || "";
                                                                    const oldValue = value?.trim() || "";
                                                                    if (newValue !== oldValue) {
                                                                        updateMutation.mutate({ id: row.id, field: col.field, value: e.target.value });
                                                                    }
                                                                    setEditCell(null);
                                                                } else if (e.key === 'Escape') {
                                                                    setEditCell(null);
                                                                }
                                                            }}
                                                            sx={{ '& .MuiInputBase-input': { fontSize: '0.75rem', py: 0 } }}
                                                        />
                                                    )
                                                ) : (
                                                    // Reuse standard renderCell or format manually
                                                    col.renderCell ? col.renderCell({
                                                        value: value,
                                                        row: row,
                                                        id: row.id,
                                                        api: {
                                                            getRowIndexRelativeToVisibleRows: () => rowIndex
                                                        }
                                                    }) : value
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                            {paginatedData.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={columns.length} align="center" sx={{ py: 8 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            No logs found matching your filters.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
}
