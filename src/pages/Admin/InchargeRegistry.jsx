import React, { useState, useMemo } from 'react';
import {
    Box, Paper, Typography, Button, TextField, InputAdornment,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TablePagination, IconButton, Tooltip, Dialog, DialogTitle,
    DialogContent, DialogActions, DialogContentText, Select,
    MenuItem, FormControl, InputLabel, Chip, CircularProgress,
    Alert, Stack, useTheme, Grid
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import GroupsIcon from '@mui/icons-material/Groups';
import StarIcon from '@mui/icons-material/Star';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import HubIcon from '@mui/icons-material/Hub';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotification } from '../../contexts/NotificationContext';

const API_BASE = 'http://localhost:3000/api';

const api = {
    getIncharges: () => fetch(`${API_BASE}/admin/incharges`).then(r => r.json()),
    getDivisions: () => fetch(`${API_BASE}/admin/divisions`).then(r => r.json()),
    createIncharge: (data) => fetch(`${API_BASE}/admin/incharges`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    }).then(async r => { const j = await r.json(); if (!r.ok) throw new Error(j.error); return j; }),
    updateIncharge: ({ id, ...data }) => fetch(`${API_BASE}/admin/incharges/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    }).then(async r => { const j = await r.json(); if (!r.ok) throw new Error(j.error); return j; }),
    deleteIncharge: (id) => fetch(`${API_BASE}/admin/incharges/${id}`, { method: 'DELETE' })
        .then(async r => { const j = await r.json(); if (!r.ok) throw new Error(j.error); return j; }),
};

const EMPTY_FORM = { firstName: '', lastName: '', division_id: '', role: '' };

const ROLE_OPTIONS = [
    'CAMS Support',
    'Cluster Lead',
    'Over All Lead',
    'Division Incharge',
    'Area Head',
    'Regional Head',
    'Operations Head',
];

// Hardcoded operations handled by each cluster head (keyed by lastName lowercase,
// with first-name fallback for unique cases like single-name entries).
const CLUSTER_HEAD_OPS = {
    'inao': 'Mindanao I & Mindanao II',
    'tejada': 'Luzon II',
    'ricky': 'Visayas I & Visayas II',   // first-name key
    'alyn': 'Luzon I',                  // first-name key
    'demetrio': 'Overall',               // first-name key
};

function getClusterHeadOp(row) {
    const ln = (row.lastName || '').toLowerCase();
    const fn = (row.firstName || '').toLowerCase();
    return CLUSTER_HEAD_OPS[ln] ?? CLUSTER_HEAD_OPS[fn] ?? null;
}

// Normalise ALL-CAPS DB operation names to Title Case, preserving Roman numerals.
function toDisplayCase(str) {
    if (!str) return str;
    return str.replace(/\S+/g, word => {
        // Keep Roman numerals uppercase (I, II, III, IV, V, VI, VII, VIII, IX, X…)
        if (/^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/i.test(word) && word.length > 0 && /^[ivxlcdm]+$/i.test(word))
            return word.toUpperCase();
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
}

function StatCard({ label, value, icon: Icon, color, tooltip }) {
    return (
        <Tooltip title={tooltip} placement="bottom" arrow>
            <Paper elevation={0} sx={{
                px: 1.5, py: 1, display: 'flex', alignItems: 'center', gap: 1.2,
                border: '1px solid', borderColor: 'divider', borderRadius: 2,
                flex: 1, minWidth: 120, cursor: 'default',
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: 2 }
            }}>
                <Box sx={{
                    width: 34, height: 34, borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    backgroundColor: `${color}22`,
                    flexShrink: 0
                }}>
                    <Icon sx={{ color, fontSize: '1rem' }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1, fontSize: '1.1rem' }}>
                        {value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem', whiteSpace: 'nowrap' }}>
                        {label}
                    </Typography>
                </Box>
            </Paper>
        </Tooltip>
    );
}

export default function InchargeRegistry() {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    const queryClient = useQueryClient();
    const { showNotification } = useNotification();

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [formOpen, setFormOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // ── Data ─────────────────────────────────────────────────────────────────
    const { data: incharges = [], isLoading, isError, error } = useQuery({
        queryKey: ['adminIncharges'],
        queryFn: api.getIncharges,
    });

    const { data: divisions = [] } = useQuery({
        queryKey: ['adminDivisions'],
        queryFn: api.getDivisions,
    });

    // ── Mutations ─────────────────────────────────────────────────────────────
    const inv = () => queryClient.invalidateQueries({ queryKey: ['adminIncharges'] });

    const createMutation = useMutation({
        mutationFn: api.createIncharge,
        onSuccess: () => { showNotification('Incharge added!', 'success'); inv(); closeForm(); },
        onError: (e) => showNotification(`Failed: ${e.message}`, 'error'),
    });
    const updateMutation = useMutation({
        mutationFn: api.updateIncharge,
        onSuccess: () => { showNotification('Incharge updated!', 'success'); inv(); closeForm(); },
        onError: (e) => showNotification(`Failed: ${e.message}`, 'error'),
    });
    const deleteMutation = useMutation({
        mutationFn: api.deleteIncharge,
        onSuccess: () => { showNotification('Deleted.', 'info'); inv(); setDeleteTarget(null); },
        onError: (e) => showNotification(`Failed: ${e.message}`, 'error'),
    });

    // ── Helpers ───────────────────────────────────────────────────────────────
    const openAdd = () => { setEditTarget(null); setForm(EMPTY_FORM); setFormOpen(true); };
    const openEdit = (row) => {
        setEditTarget(row);
        setForm({ firstName: row.firstName, lastName: row.lastName, division_id: row.division_id ?? '', role: row.role ?? '' });
        setFormOpen(true);
    };
    const closeForm = () => { setFormOpen(false); setEditTarget(null); setForm(EMPTY_FORM); };

    const handleSave = () => {
        if (!form.firstName.trim() || !form.lastName.trim()) {
            showNotification('First name and last name are required.', 'warning'); return;
        }
        const payload = {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            division_id: form.division_id || null,
            role: form.role.trim() || null,
        };
        if (editTarget) updateMutation.mutate({ id: editTarget.id, ...payload });
        else createMutation.mutate(payload);
    };

    // ── Stats (memoised) ──────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const uniqueNames = new Set();
        const uniqueDivIds = new Set();
        const uniqueOpIds = new Set();
        const camsNames = new Set(); // distinct names for CAMS Support
        let clusterHeads = 0;
        let overallLeads = 0;

        incharges.forEach(r => {
            const fullName = `${r.firstName} ${r.lastName}`.trim().toLowerCase();
            uniqueNames.add(fullName);

            if (r.division_id != null) uniqueDivIds.add(r.division_id);
            const opId = r.Division?.OperationDB1?.id ?? r.Division?.operation?.id;
            if (opId != null) uniqueOpIds.add(opId);

            // Count strictly by role — matches actual DB values
            const role = (r.role || '').trim().toLowerCase();
            if (role === 'cluster lead') clusterHeads++;
            if (role === 'over all lead' || role.includes('operations head')) overallLeads++;
            if (role === 'cams support' || role === 'division incharge') camsNames.add(fullName);
        });

        return {
            total: uniqueNames.size,
            clusterHeads,
            overallLeads,
            camsSupport: camsNames.size,
            divisions: uniqueDivIds.size,
            operations: uniqueOpIds.size,
        };
    }, [incharges]);

    // ── Filtered + Paginated ──────────────────────────────────────────────────
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return incharges.filter(r =>
            !q ||
            r.firstName?.toLowerCase().includes(q) ||
            r.lastName?.toLowerCase().includes(q) ||
            r.Division?.division?.toLowerCase().includes(q) ||
            (r.Division?.OperationDB1?.name ?? r.Division?.operation?.name)?.toLowerCase().includes(q) ||
            r.role?.toLowerCase().includes(q)
        );
    }, [incharges, search]);

    const paginated = useMemo(() => {
        return filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [filtered, page, rowsPerPage]);

    // ── Cell helpers ──────────────────────────────────────────────────────────
    const getOperation = (row) => {
        // For rows with a division, join through DB
        const dbOp = row.Division?.OperationDB1?.name ?? row.Division?.operation?.name;
        if (dbOp) return dbOp;
        // For cluster heads (no division), use the hardcoded mapping
        return getClusterHeadOp(row);
    };

    const getDivisionLabel = (row) => {
        if (row.Division?.division) return row.Division.division;
        if (row.division_id != null) return `Division #${row.division_id}`;
        return null;
    };

    // ── UI ────────────────────────────────────────────────────────────────────
    if (isLoading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
        </Box>
    );
    if (isError) return <Alert severity="error">Failed to load: {error?.message}</Alert>;

    const isBusy = createMutation.isPending || updateMutation.isPending;
    const COLS = ['#', 'First Name', 'Last Name', 'Role', 'Division', 'Operation', 'Actions'];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>

            {/* ── Header ── */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <AdminPanelSettingsIcon sx={{ color: theme.palette.primary.main, fontSize: '1.8rem' }} />
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        Division Incharge Registry
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Admin Control · Manage responsible incharge personnel
                    </Typography>
                </Box>
            </Box>

            {/* ── Summary Bar ── */}
            <Grid container spacing={1}>
                {[
                    { label: 'Total Incharges', value: stats.total, icon: PersonIcon, color: '#1976d2' },
                    { label: 'Cluster Heads', value: stats.clusterHeads, icon: HubIcon, color: '#9c27b0' },
                    { label: 'Overall Leads', value: stats.overallLeads, icon: EmojiEventsIcon, color: '#f57c00' },
                    { label: 'CAMS Support', value: stats.camsSupport, icon: SupportAgentIcon, color: '#0288d1' },
                    { label: 'Divisions', value: stats.divisions, icon: GroupsIcon, color: '#388e3c' },
                    { label: 'Operations', value: stats.operations, icon: AccountTreeIcon, color: '#7b1fa2' },
                ].map(s => (
                    <Grid item xs={6} sm={4} md={2} key={s.label}>
                        <StatCard {...s} />
                    </Grid>
                ))}
            </Grid>

            {/* ── Toolbar ── */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                    size="small"
                    placeholder="Search name, role, division or operation…"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(0); }}
                    sx={{ minWidth: 320 }}
                    inputProps={{ style: { fontSize: '0.8rem' } }}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} /></InputAdornment>,
                        endAdornment: search ? (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setSearch('')}><ClearIcon sx={{ fontSize: '0.9rem' }} /></IconButton>
                            </InputAdornment>
                        ) : null
                    }}
                />
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openAdd}
                    sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                >
                    Add Incharge
                </Button>

                {/* Pagination controls — beside Add Incharge */}
                <TablePagination
                    component="div"
                    count={filtered.length}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={(_, p) => setPage(p)}
                    onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    sx={{
                        ml: 'auto',
                        '& .MuiTablePagination-toolbar': { minHeight: 40, p: 0 },
                        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                            fontSize: '0.75rem',
                            fontWeight: 600,
                        },
                        '& .MuiTablePagination-select': {
                            fontSize: '0.75rem',
                            fontWeight: 700,
                        },
                        border: 'none',
                    }}
                    SelectProps={{
                        MenuProps: {
                            PaperProps: {
                                sx: {
                                    '& .MuiMenuItem-root': {
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                    }
                                }
                            }
                        }
                    }}
                />
            </Box>

            {/* ── Table ── */}
            <Paper elevation={0} sx={{ flexGrow: 1, border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <TableContainer sx={{ flexGrow: 1, overflow: 'auto', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                {COLS.map((h, i) => (
                                    <TableCell key={h} align={i === COLS.length - 1 ? 'center' : 'left'} sx={{
                                        backgroundColor: isDarkMode ? theme.palette.primary.dark : '#344955',
                                        color: 'white', fontWeight: 800, fontSize: '0.7rem',
                                        borderRight: '1px solid rgba(255,255,255,0.15)',
                                        '&:last-child': { borderRight: 'none' },
                                        whiteSpace: 'nowrap',
                                        minWidth: i === 0 ? 48 : i === COLS.length - 1 ? 90 : 140,
                                    }}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginated.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={COLS.length} align="center" sx={{ py: 6, color: 'text.secondary', fontStyle: 'italic' }}>
                                        {search ? 'No results found.' : 'No records yet. Click "Add Incharge" to get started.'}
                                    </TableCell>
                                </TableRow>
                            ) : paginated.map((row, idx) => {
                                // Role-based flags using exact DB values
                                const roleNorm = (row.role || '').trim().toLowerCase();
                                const isClusterHead = roleNorm === 'cluster lead';
                                const isOverallLead = roleNorm === 'over all lead' || roleNorm.includes('operations head');
                                const divLabel = getDivisionLabel(row);
                                const opLabel = getOperation(row);
                                const roleStr = row.role || '';

                                return (
                                    <TableRow key={row.id} sx={{
                                        '&:nth-of-type(even)': { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.02)' : '#fafafa' },
                                        '&:hover': { backgroundColor: theme.palette.action.hover }
                                    }}>
                                        {/* # */}
                                        <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary', py: 0.5 }}>
                                            {page * rowsPerPage + idx + 1}
                                        </TableCell>
                                        {/* First Name */}
                                        <TableCell sx={{ fontSize: '0.75rem', py: 0.5, fontWeight: 500 }}>{row.firstName}</TableCell>
                                        {/* Last Name */}
                                        <TableCell sx={{ fontSize: '0.75rem', py: 0.5, fontWeight: 500 }}>{row.lastName}</TableCell>
                                        {/* Role */}
                                        <TableCell sx={{ py: 0.5 }}>
                                            {roleStr ? (
                                                <Chip
                                                    label={roleStr}
                                                    size="small"
                                                    icon={isClusterHead ? <StarIcon sx={{ fontSize: '0.65rem !important', ml: '6px !important' }} /> : undefined}
                                                    sx={{
                                                        fontSize: '0.65rem', height: 20, borderRadius: 1,
                                                        border: '1px solid',
                                                        borderColor: isClusterHead ? '#9c27b0'
                                                            : isOverallLead ? '#f57c00'
                                                                : roleNorm === 'cams support' || roleNorm === 'division incharge' ? '#0288d1'
                                                                    : 'divider',
                                                        color: isClusterHead ? '#9c27b0'
                                                            : isOverallLead ? '#f57c00'
                                                                : roleNorm === 'cams support' || roleNorm === 'division incharge' ? '#0288d1'
                                                                    : 'text.primary',
                                                        backgroundColor: isClusterHead
                                                            ? (isDarkMode ? 'rgba(156,39,176,0.15)' : 'rgba(156,39,176,0.08)')
                                                            : isOverallLead
                                                                ? (isDarkMode ? 'rgba(245,124,0,0.15)' : 'rgba(245,124,0,0.08)')
                                                                : roleNorm === 'cams support' || roleNorm === 'division incharge'
                                                                    ? (isDarkMode ? 'rgba(2,136,209,0.15)' : 'rgba(2,136,209,0.08)')
                                                                    : 'transparent',
                                                    }}
                                                />
                                            ) : <Typography variant="caption" color="text.disabled">—</Typography>}
                                        </TableCell>
                                        {/* Division */}
                                        <TableCell sx={{ py: 0.5 }}>
                                            {/* null division: show role as the chip label */}
                                            {row.division_id == null ? (
                                                roleStr ? (
                                                    <Chip
                                                        label={roleStr}
                                                        size="small"
                                                        sx={{
                                                            fontSize: '0.65rem', height: 20, borderRadius: 1,
                                                            border: '1px solid',
                                                            borderColor: isClusterHead ? '#ff9800' : '#f57c00',
                                                            color: isClusterHead ? '#ff9800' : '#f57c00',
                                                            fontStyle: 'italic',
                                                        }}
                                                    />
                                                ) : <Typography variant="caption" color="text.disabled">—</Typography>
                                            ) : divLabel ? (
                                                <Chip label={divLabel} size="small" variant="outlined"
                                                    sx={{ fontSize: '0.65rem', height: 20, borderRadius: 1 }}
                                                />
                                            ) : <Typography variant="caption" color="text.disabled">—</Typography>}
                                        </TableCell>
                                        {/* Operation (join) */}
                                        <TableCell sx={{ py: 0.5 }}>
                                            {opLabel ? (
                                                <Chip label={toDisplayCase(opLabel)} size="small"
                                                    sx={{
                                                        fontSize: '0.65rem', height: 20, borderRadius: 1,
                                                        backgroundColor: isDarkMode ? 'rgba(123,31,162,0.15)' : 'rgba(123,31,162,0.08)',
                                                        color: '#7b1fa2', border: '1px solid rgba(123,31,162,0.4)'
                                                    }}
                                                />
                                            ) : <Typography variant="caption" color="text.disabled">—</Typography>}
                                        </TableCell>
                                        {/* Actions */}
                                        <TableCell align="center" sx={{ py: 0.5 }}>
                                            <Stack direction="row" spacing={0.75} justifyContent="center">
                                                {/* Edit */}
                                                <Tooltip title="Edit record" arrow placement="top">
                                                    <Button
                                                        size="small"
                                                        onClick={() => openEdit(row)}
                                                        startIcon={<EditIcon sx={{ fontSize: '0.75rem !important' }} />}
                                                        sx={{
                                                            fontSize: '0.68rem', fontWeight: 600,
                                                            textTransform: 'none',
                                                            minWidth: 0, px: 1.2, py: 0.4,
                                                            borderRadius: 99,
                                                            color: theme.palette.primary.main,
                                                            backgroundColor: isDarkMode
                                                                ? 'rgba(25,118,210,0.12)'
                                                                : 'rgba(25,118,210,0.08)',
                                                            border: '1px solid',
                                                            borderColor: isDarkMode
                                                                ? 'rgba(25,118,210,0.3)'
                                                                : 'rgba(25,118,210,0.2)',
                                                            transition: 'all 0.18s ease',
                                                            '&:hover': {
                                                                backgroundColor: isDarkMode
                                                                    ? 'rgba(25,118,210,0.22)'
                                                                    : 'rgba(25,118,210,0.15)',
                                                                borderColor: theme.palette.primary.main,
                                                                transform: 'translateY(-1px)',
                                                                boxShadow: '0 3px 8px rgba(25,118,210,0.25)',
                                                            },
                                                        }}
                                                    >
                                                        Edit
                                                    </Button>
                                                </Tooltip>

                                                {/* Delete */}
                                                <Tooltip title="Delete record" arrow placement="top">
                                                    <Button
                                                        size="small"
                                                        onClick={() => setDeleteTarget(row)}
                                                        startIcon={<DeleteIcon sx={{ fontSize: '0.75rem !important' }} />}
                                                        sx={{
                                                            fontSize: '0.68rem', fontWeight: 600,
                                                            textTransform: 'none',
                                                            minWidth: 0, px: 1.2, py: 0.4,
                                                            borderRadius: 99,
                                                            color: theme.palette.error.main,
                                                            backgroundColor: isDarkMode
                                                                ? 'rgba(211,47,47,0.12)'
                                                                : 'rgba(211,47,47,0.07)',
                                                            border: '1px solid',
                                                            borderColor: isDarkMode
                                                                ? 'rgba(211,47,47,0.3)'
                                                                : 'rgba(211,47,47,0.18)',
                                                            transition: 'all 0.18s ease',
                                                            '&:hover': {
                                                                backgroundColor: isDarkMode
                                                                    ? 'rgba(211,47,47,0.22)'
                                                                    : 'rgba(211,47,47,0.13)',
                                                                borderColor: theme.palette.error.main,
                                                                transform: 'translateY(-1px)',
                                                                boxShadow: '0 3px 8px rgba(211,47,47,0.25)',
                                                            },
                                                        }}
                                                    >
                                                        Delete
                                                    </Button>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* ── Add / Edit Dialog ── */}
            <Dialog open={formOpen} onClose={closeForm} maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}>

                {/* Header */}
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                    color: 'white', p: 0,
                    borderRadius: '12px 12px 0 0',
                }}>
                    <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            width: 38, height: 38, borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.18)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                            <AdminPanelSettingsIcon sx={{ fontSize: '1.2rem', color: 'white' }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.2 }}>
                                {editTarget ? 'Edit Incharge' : 'Add New Incharge'}
                            </Typography>
                            <Typography sx={{ fontSize: '0.72rem', opacity: 0.8 }}>
                                {editTarget
                                    ? `Editing: ${editTarget.firstName} ${editTarget.lastName}`
                                    : 'Fill in the details for the new personnel'}
                            </Typography>
                        </Box>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ pt: 3, pb: 1, px: 3, overflow: 'visible' }}>
                    <Stack spacing={2} sx={{ mt: 1.5 }}>

                        {/* Name row — side by side */}
                        <Stack direction="row" spacing={1.5}>
                            <TextField label="First Name" size="small" fullWidth autoFocus
                                value={form.firstName}
                                onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                            />
                            <TextField label="Last Name" size="small" fullWidth
                                value={form.lastName}
                                onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                            />
                        </Stack>

                        {/* Role */}
                        <FormControl size="small" fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                label="Role"
                                value={form.role}
                                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                                MenuProps={{ PaperProps: { sx: { maxHeight: 220 } } }}
                                renderValue={(val) => val || <em style={{ color: '#999' }}>— None —</em>}
                            >
                                <MenuItem value=""><em>— None —</em></MenuItem>
                                {ROLE_OPTIONS.map(r => (
                                    <MenuItem key={r} value={r} sx={{ fontSize: '0.82rem', py: 0.8 }}>
                                        {r}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Division — capped height */}
                        <FormControl size="small" fullWidth>
                            <InputLabel>Division</InputLabel>
                            <Select
                                label="Division"
                                value={form.division_id}
                                onChange={e => setForm(f => ({ ...f, division_id: e.target.value }))}
                                MenuProps={{
                                    PaperProps: {
                                        sx: {
                                            maxHeight: 220,
                                            '& .MuiMenuItem-root': { fontSize: '0.8rem', py: 0.6 },
                                        }
                                    }
                                }}
                                renderValue={(val) => {
                                    if (!val) return <em style={{ color: '#999' }}>— None (Cluster Lead) —</em>;
                                    const d = divisions.find(x => x.id === val);
                                    return d ? d.division : `Division #${val}`;
                                }}
                            >
                                <MenuItem value="">
                                    <em style={{ fontSize: '0.82rem' }}>— None (Cluster Lead) —</em>
                                </MenuItem>
                                {divisions.map(d => (
                                    <MenuItem key={d.id} value={d.id} sx={{ fontSize: '0.8rem', py: 0.6 }}>
                                        {d.division}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
                    <Button onClick={closeForm} variant="outlined"
                        sx={{ textTransform: 'none', borderRadius: 2, minWidth: 90 }}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} variant="contained" disabled={isBusy}
                        startIcon={isBusy ? <CircularProgress size={14} color="inherit" /> : null}
                        sx={{
                            textTransform: 'none', fontWeight: 700, borderRadius: 2, minWidth: 120,
                            background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                            boxShadow: '0 3px 10px rgba(25,118,210,0.35)',
                            '&:hover': { boxShadow: '0 5px 14px rgba(25,118,210,0.5)' },
                        }}>
                        {editTarget ? 'Save Changes' : 'Add Incharge'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Delete Confirm ── */}
            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem' }}>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ fontSize: '0.85rem' }}>
                        Are you sure you want to delete{' '}
                        <strong>{deleteTarget?.firstName} {deleteTarget?.lastName}</strong>?
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button onClick={() => setDeleteTarget(null)} variant="outlined" sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
                    <Button onClick={() => deleteMutation.mutate(deleteTarget.id)} variant="contained" color="error"
                        disabled={deleteMutation.isPending}
                        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
