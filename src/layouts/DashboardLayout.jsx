import * as React from 'react';
import { AppBar, Box, CssBaseline, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Collapse, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LinkIcon from '@mui/icons-material/Link';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import StarBorder from '@mui/icons-material/StarBorder';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import RefreshIcon from '@mui/icons-material/Refresh';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useColorMode } from '../theme/ThemeContext';
import { Fab, Zoom, useScrollTrigger } from '@mui/material';

const defaultDrawerWidth = 240;
const miniDrawerWidth = 60;
const headerHeight = 80;

function DashboardLayout(props) {
    const { window: windowProp } = props;
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [sidebarOpen, setSidebarOpen] = React.useState(true);
    const [openLogs, setOpenLogs] = React.useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const colorMode = useColorMode();
    const [isScrollable, setIsScrollable] = React.useState(false);
    const [scrollPos, setScrollPos] = React.useState(0);


    const checkScrollable = React.useCallback(() => {
        const target = document.querySelector('.MuiDataGrid-virtualScroller') ||
            document.querySelector('.MuiTableContainer-root') ||
            document.querySelector('.scroll-container');
        if (target) {
            setIsScrollable(target.scrollHeight > target.clientHeight);
            setScrollPos(target.scrollTop);
        } else {
            setIsScrollable(false);
            setScrollPos(0);
        }
    }, []);

    React.useEffect(() => {
        checkScrollable();
        // Check periodically as data might load async or filters might change
        const intervalId = setInterval(checkScrollable, 1000);
        window.addEventListener('resize', checkScrollable);

        // Handle real-time scroll updates for button toggling
        const handleScroll = (e) => {
            if (e.target.classList.contains('MuiDataGrid-virtualScroller') ||
                e.target.classList.contains('MuiTableContainer-root') ||
                e.target.classList.contains('scroll-container')) {
                setScrollPos(e.target.scrollTop);
            }
        };

        document.addEventListener('scroll', handleScroll, true);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('resize', checkScrollable);
            document.removeEventListener('scroll', handleScroll, true);
        };
    }, [checkScrollable]);
    const drawerWidth = sidebarOpen ? defaultDrawerWidth : miniDrawerWidth;

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleSidebarToggle = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleLogsClick = () => {
        if (!sidebarOpen) {
            setSidebarOpen(true);
            setOpenLogs(true);
            navigate('/consolidated-logs/staff-access');
        } else {
            setOpenLogs(!openLogs);
        }
    };

    const menuItems = [
        { text: 'Monthly Save Report', icon: <DescriptionIcon />, path: '/' },
        { text: 'Daily Save Report', icon: <DashboardIcon />, path: '/daily' },
        { text: 'Client Tracker', icon: <PeopleIcon />, path: '/client-tracker' },
        { text: 'Client Number Finder', icon: <SearchIcon />, path: '/contact-search' },
        { text: 'CAMS Support Logs', icon: <SupportAgentIcon />, path: '/support-logs' },
        { text: 'Dashboard vs FS', icon: <AssessmentIcon />, path: '/dashboard-vs-fs' },
    ];

    const renderDrawer = (isMini) => (
        <Box sx={{ overflowX: 'hidden' }}>
            <Toolbar sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: headerHeight,
                px: 1
            }}>
                <Tooltip title="ASA Philippines Foundation, Inc." placement="right">
                    <Box
                        component="img"
                        src="/logo.png"
                        alt="Company Logo"
                        onClick={() => {
                            if (mobileOpen) setMobileOpen(false);
                            navigate('/');
                        }}
                        sx={{
                            height: !isMini ? 64 : 40,
                            width: 'auto',
                            transition: 'height 0.2s',
                            objectFit: 'contain',
                            cursor: 'pointer'
                        }}
                    />
                </Tooltip>
            </Toolbar>
            <Divider />
            <List sx={{ pt: 1 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                        <Tooltip title={isMini ? item.text : ""} placement="right">
                            <ListItemButton
                                selected={location.pathname === item.path}
                                onClick={() => {
                                    if (mobileOpen) setMobileOpen(false);
                                    navigate(item.path);
                                }}
                                sx={{
                                    minHeight: !isMini ? 48 : 40,
                                    py: 0.5,
                                    justifyContent: !isMini ? 'initial' : 'center',
                                    px: !isMini ? 2.5 : 1.5,
                                    mb: 0.5,
                                    mx: !isMini ? 0 : 0.8,
                                    borderRadius: !isMini ? 0 : '12px',
                                    '&.Mui-selected': {
                                        backgroundColor: (theme) => theme.palette.mode === 'light'
                                            ? 'rgba(25, 118, 210, 0.08)'
                                            : 'rgba(25, 118, 210, 0.15)',
                                        borderRight: !isMini ? '4px solid #1976d2' : 'none',
                                        '&:hover': {
                                            backgroundColor: (theme) => theme.palette.mode === 'light'
                                                ? 'rgba(25, 118, 210, 0.12)'
                                                : 'rgba(25, 118, 210, 0.2)',
                                        }
                                    },
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: !isMini ? 2 : 0,
                                        justifyContent: 'center',
                                        color: location.pathname === item.path ? '#1976d2' : 'inherit',
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text} sx={{ opacity: !isMini ? 1 : 0 }} />
                            </ListItemButton>
                        </Tooltip>
                    </ListItem>
                ))}

                {/* Consolidated Logs Sub-menu */}
                <ListItem disablePadding sx={{ display: 'block' }}>
                    <Tooltip title={isMini ? "Logs Consolidated" : ""} placement="right">
                        <ListItemButton
                            selected={isMini && location.pathname.startsWith('/consolidated-logs')}
                            onClick={() => {
                                if (isMini) {
                                    setSidebarOpen(true);
                                    setOpenLogs(true);
                                    navigate('/consolidated-logs/staff-access');
                                } else {
                                    setOpenLogs(!openLogs);
                                }
                            }}
                            sx={{
                                minHeight: !isMini ? 48 : 40,
                                py: 0.5,
                                justifyContent: !isMini ? 'initial' : 'center',
                                px: !isMini ? 2.5 : 1.5,
                                mb: 0.5,
                                mx: !isMini ? 0 : 0.8,
                                borderRadius: !isMini ? 0 : '12px',
                                '&.Mui-selected': {
                                    backgroundColor: (theme) => theme.palette.mode === 'light'
                                        ? 'rgba(25, 118, 210, 0.08)'
                                        : 'rgba(25, 118, 210, 0.15)',
                                    borderRight: !isMini ? '4px solid #1976d2' : 'none',
                                },
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 0,
                                    mr: !isMini ? 2 : 0,
                                    justifyContent: 'center',
                                    color: (isMini && location.pathname.startsWith('/consolidated-logs')) ? '#1976d2' : 'inherit',
                                }}
                            >
                                <AssignmentIcon />
                            </ListItemIcon>
                            {!isMini && <ListItemText primary="Logs Consolidated" />}
                            {!isMini && (openLogs ? <ExpandLess /> : <ExpandMore />)}
                        </ListItemButton>
                    </Tooltip>
                </ListItem>
                <Collapse in={openLogs && !isMini} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItemButton
                            selected={location.pathname === '/consolidated-logs/staff-access'}
                            sx={{
                                pl: 4,
                                minHeight: 32,
                                py: 0.2,
                                '&.Mui-selected': {
                                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                    borderRight: '4px solid #1976d2',
                                }
                            }}
                            onClick={() => {
                                if (mobileOpen) setMobileOpen(false);
                                navigate('/consolidated-logs/staff-access');
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 35 }}>
                                <AccountCircleIcon fontSize="small" sx={{ color: location.pathname === '/consolidated-logs/staff-access' ? '#1976d2' : 'inherit' }} />
                            </ListItemIcon>
                            <ListItemText primary="Staff Access" primaryTypographyProps={{ variant: 'body2' }} />
                        </ListItemButton>

                        <ListItemButton
                            selected={location.pathname === '/consolidated-logs/cams-adjustment'}
                            sx={{
                                pl: 4,
                                minHeight: 32,
                                py: 0.2,
                                '&.Mui-selected': {
                                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                    borderRight: '4px solid #1976d2',
                                }
                            }}
                            onClick={() => {
                                if (mobileOpen) setMobileOpen(false);
                                navigate('/consolidated-logs/cams-adjustment');
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 35 }}>
                                <SettingsSuggestIcon fontSize="small" sx={{ color: location.pathname === '/consolidated-logs/cams-adjustment' ? '#1976d2' : 'inherit' }} />
                            </ListItemIcon>
                            <ListItemText primary="CAMS Adjustment" primaryTypographyProps={{ variant: 'body2' }} />
                        </ListItemButton>

                        <ListItemButton
                            selected={location.pathname === '/consolidated-logs/cams-reopen'}
                            sx={{
                                pl: 4,
                                minHeight: 32,
                                py: 0.2,
                                '&.Mui-selected': {
                                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                    borderRight: '4px solid #1976d2',
                                }
                            }}
                            onClick={() => {
                                if (mobileOpen) setMobileOpen(false);
                                navigate('/consolidated-logs/cams-reopen');
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 35 }}>
                                <RefreshIcon fontSize="small" sx={{ color: location.pathname === '/consolidated-logs/cams-reopen' ? '#1976d2' : 'inherit' }} />
                            </ListItemIcon>
                            <ListItemText primary="CAMS Reopen" primaryTypographyProps={{ variant: 'body2' }} />
                        </ListItemButton>

                        <ListItemButton
                            selected={location.pathname === '/consolidated-logs/daily-concerns'}
                            sx={{
                                pl: 4,
                                minHeight: 32,
                                py: 0.2,
                                '&.Mui-selected': {
                                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                    borderRight: '4px solid #1976d2',
                                }
                            }}
                            onClick={() => {
                                if (mobileOpen) setMobileOpen(false);
                                navigate('/consolidated-logs/daily-concerns');
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 35 }}>
                                <ErrorOutlineIcon fontSize="small" sx={{ color: location.pathname === '/consolidated-logs/daily-concerns' ? '#1976d2' : 'inherit' }} />
                            </ListItemIcon>
                            <ListItemText primary="Daily Concerns" primaryTypographyProps={{ variant: 'body2' }} />
                        </ListItemButton>
                    </List>
                </Collapse>

                <ListItem disablePadding sx={{ display: 'block' }}>
                    <Tooltip title={isMini ? "Resource Link Directory" : ""} placement="right">
                        <ListItemButton
                            selected={location.pathname === '/resources'}
                            onClick={() => {
                                if (mobileOpen) setMobileOpen(false);
                                navigate('/resources');
                            }}
                            sx={{
                                minHeight: !isMini ? 48 : 40,
                                py: 0.5,
                                justifyContent: !isMini ? 'initial' : 'center',
                                px: !isMini ? 2.5 : 1.5,
                                mb: 0.5,
                                mx: !isMini ? 0 : 0.8,
                                borderRadius: !isMini ? 0 : '12px',
                                '&.Mui-selected': {
                                    backgroundColor: (theme) => theme.palette.mode === 'light'
                                        ? 'rgba(25, 118, 210, 0.08)'
                                        : 'rgba(25, 118, 210, 0.15)',
                                    borderRight: !isMini ? '4px solid #1976d2' : 'none',
                                },
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 0,
                                    mr: !isMini ? 2 : 0,
                                    justifyContent: 'center',
                                    color: location.pathname === '/resources' ? '#1976d2' : 'inherit',
                                }}
                            >
                                <LinkIcon />
                            </ListItemIcon>
                            <ListItemText primary="Resource Link Directory" sx={{ opacity: !isMini ? 1 : 0 }} />
                        </ListItemButton>
                    </Tooltip>
                </ListItem>
            </List>
        </Box>
    );

    const container = windowProp !== undefined ? () => windowProp().document.body : undefined;

    const scrollToTarget = (direction) => {
        const target = document.querySelector('.MuiDataGrid-virtualScroller') ||
            document.querySelector('.MuiTableContainer-root') ||
            document.querySelector('.scroll-container');
        if (target) {
            target.scrollTo({
                top: direction === 'top' ? 0 : target.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    height: headerHeight,
                    justifyContent: 'center',
                    transition: (theme) => theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                    ...(sidebarOpen && {
                        ml: { sm: `${defaultDrawerWidth}px` },
                        width: { sm: `calc(100% - ${defaultDrawerWidth}px)` },
                        transition: (theme) => theme.transitions.create(['width', 'margin'], {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                    }),
                    ...(!sidebarOpen && {
                        ml: { sm: `${miniDrawerWidth}px` },
                        width: { sm: `calc(100% - ${miniDrawerWidth}px)` },
                    })
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <IconButton
                        color="inherit"
                        aria-label="toggle sidebar"
                        edge="start"
                        onClick={handleSidebarToggle}
                        sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        CAMS Support Portal
                    </Typography>
                    <Tooltip title={`Switch to ${colorMode.mode === 'dark' ? 'light' : 'dark'} mode`}>
                        <IconButton onClick={colorMode.toggleColorMode} color="inherit">
                            {colorMode.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{
                    width: { sm: drawerWidth },
                    flexShrink: { sm: 0 },
                }}
                aria-label="mailbox folders"
            >
                <Drawer
                    container={container}
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: defaultDrawerWidth },
                    }}
                >
                    {renderDrawer(false)}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            overflowX: 'hidden',
                        },
                    }}
                    open={sidebarOpen}
                >
                    {renderDrawer(!sidebarOpen)}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100vh',
                    overflow: 'hidden', // CRITICAL: Prevent outer scrollbar
                }}
            >
                <Toolbar />
                <Box sx={{ flexGrow: 1, minHeight: 0, p: 3, display: 'flex', flexDirection: 'column' }}>
                    <Outlet />
                </Box>

                {/* Footer */}
                <Box
                    component="footer"
                    sx={{
                        py: 2,
                        px: 3,
                        backgroundColor: (theme) =>
                            theme.palette.mode === 'light'
                                ? theme.palette.grey[200]
                                : theme.palette.grey[800],
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        © Copyright 2026 Maintained by <strong>Norwil Cabrito</strong>
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        Version 1.0.0 (Staging)
                    </Typography>
                </Box>

                {/* Scroll Navigation Buttons */}
                <Zoom in={isScrollable && scrollPos > 50}>
                    <Box sx={{ position: 'fixed', bottom: 90, right: 32, display: 'flex', flexDirection: 'column', gap: 1, zIndex: 1100 }}>
                        {(() => {
                            const target = document.querySelector('.MuiDataGrid-virtualScroller') ||
                                document.querySelector('.MuiTableContainer-root') ||
                                document.querySelector('.scroll-container');
                            if (!target) return null;

                            // Calculate halfway point
                            const halfway = (target.scrollHeight - target.clientHeight) / 2;
                            const isAtUpperHalf = scrollPos < halfway;

                            return isAtUpperHalf ? (
                                <Tooltip title="Scroll to Bottom" placement="left">
                                    <Fab color="secondary" size="small" onClick={() => scrollToTarget('bottom')}>
                                        <KeyboardArrowDownIcon />
                                    </Fab>
                                </Tooltip>
                            ) : (
                                <Tooltip title="Scroll to Top" placement="left">
                                    <Fab color="primary" size="small" onClick={() => scrollToTarget('top')}>
                                        <KeyboardArrowUpIcon />
                                    </Fab>
                                </Tooltip>
                            );
                        })()}
                    </Box>
                </Zoom>
            </Box>
        </Box>
    );
}

export default DashboardLayout;
