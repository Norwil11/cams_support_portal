import { Typography, Box, Tooltip, Grid, Card, CardActionArea, CardContent, CardActions, Button, Avatar } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CommuteIcon from '@mui/icons-material/Commute';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SummarizeIcon from '@mui/icons-material/Summarize';
import StorageIcon from '@mui/icons-material/Storage';
import SecurityIcon from '@mui/icons-material/Security';
import './ResourceDirectory.css';

const APPSHEET_GALLERY_DATA = [
    {
        category: "AppSheet Links",
        name: "Daily Travel Logs",
        description: "Record daily travel movements, mileage, and destinations for field support personnel.",
        link: "https://www.appsheet.com/start/c9770859-252a-44d6-ad3b-2cb8513c059c",
        icon: <CommuteIcon />,
        color: '#1976d2'
    },
    {
        category: "AppSheet Links",
        name: "Monthly Travel Plan",
        description: "Plan and submit monthly travel schedules and budget forecasts for approval.",
        link: "https://www.appsheet.com/start/3e660e1f-9121-42ff-8db0-c5eca7a5340a",
        icon: <EventNoteIcon />,
        color: '#2e7d32'
    },
    {
        category: "AppSheet Links",
        name: "IT Incident Report Monitoring",
        description: "Log, track, and monitor the status and resolution of reported IT incidents and outages.",
        link: "https://www.appsheet.com/start/75df3d1e-9516-4c6f-bd7d-73ffd4120de3",
        icon: <ErrorOutlineIcon />,
        color: '#d32f2f'
    },
    {
        category: "AppSheet Links",
        name: "IT Service Report",
        description: "Generate summary reports detailing support service metrics, resolution times, and team performance.",
        link: "https://www.appsheet.com/start/1f72e092-9017-43be-b626-8a36b04a7a4d",
        icon: <SummarizeIcon />,
        color: '#ed6c02'
    },
    {
        category: "Web App & Google Sheet Links",
        name: "CAMS Support TOC Archive",
        description: "This stores historical records and documentation associated with client transfer activities (TOC) handled by CAMS Support. It enables teams to reference past transfers, ensure process continuity, and support issue resolution and audits.",
        link: "https://script.google.com/a/macros/asaphil.org/s/AKfycbxjCwZorhw5Hp_P4YNGnO_61eHYEeB4fvhycNASputNSoFJzTz1vqJnyPf6zaQJYb7d0Q/exec",
        icon: <StorageIcon />,
        color: '#9c27b0'
    },
    {
        category: "AppSheet Links",
        name: "CAMS Incident Reporting",
        description: "Incident Reporting App for managing workflows around registering incidents, root cause analysis, and approving closure of incidents. Register incidents & track corrective actions",
        link: "https://www.appsheet.com/start/173468f2-c4b5-4cd9-b861-96694a5965da",
        icon: <SecurityIcon />,
        color: '#0288d1'
    }
];

export default function ResourceDirectory() {
    const categories = [...new Set(APPSHEET_GALLERY_DATA.map(item => item.category))];

    return (
        <Box
            className="scroll-container"
            sx={{
                p: 4,
                height: '100%',
                overflowY: 'auto',
                bgcolor: 'background.default',
                '&::-webkit-scrollbar': { display: 'none' },
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
            }}
        >
            <Box sx={{ mb: 6 }}>
                <Typography variant="h3" sx={{
                    fontWeight: 800,
                    mb: 1,
                    letterSpacing: '-0.02em',
                    color: 'text.primary'
                }}>
                    Resource Link <Box component="span" sx={{ color: 'primary.main' }}>Directory</Box>
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
                    Access all IT support tools, movement logs, and historical archives in one central hub.
                </Typography>
            </Box>

            {categories.map((category, catIdx) => (
                <Box key={category} sx={{ mb: 8 }}>
                    <Typography variant="h5" className="category-header-glow" sx={{
                        fontWeight: 700,
                        mb: 4,
                        color: 'text.primary',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontSize: '1.1rem'
                    }}>
                        {category}
                    </Typography>

                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
                            md: 'repeat(4, 1fr)'
                        },
                        gap: 4
                    }}>
                        {APPSHEET_GALLERY_DATA
                            .filter(item => item.category === category)
                            .map((app, index) => (
                                <Box key={index} className="resource-card-container" sx={{
                                    animationDelay: `${(catIdx * 3 + index) * 0.1}s`,
                                    display: 'flex'
                                }}>
                                    <Tooltip title={`Launch ${app.name}`} arrow placement="top">
                                        <Card className="appsheet-card-premium" sx={{
                                            height: '100%',
                                            width: '100%',
                                            position: 'relative',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            borderRadius: 4,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                            '&:hover': {
                                                transform: 'translateY(-10px) scale(1.02)',
                                                boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                                                borderColor: app.color,
                                                '& .launch-btn': {
                                                    bgcolor: app.color,
                                                    boxShadow: `0 8px 15px ${app.color}40`,
                                                    transform: 'scale(1.05)'
                                                },
                                                '& .icon-avatar': {
                                                    transform: 'rotate(10deg) scale(1.1)',
                                                    bgcolor: `${app.color} !important`,
                                                    color: '#ffffff !important'
                                                },
                                                '& .icon-avatar *': {
                                                    color: '#ffffff !important'
                                                }
                                            }
                                        }}>
                                            <CardActionArea
                                                component="a"
                                                href={app.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                sx={{
                                                    flexGrow: 1,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'stretch',
                                                    p: 1
                                                }}
                                            >
                                                <CardContent sx={{ pt: 3, px: 3, flexGrow: 1 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5, gap: 2 }}>
                                                        <Avatar className="icon-avatar" sx={{
                                                            bgcolor: app.color,
                                                            color: '#fff',
                                                            width: 48,
                                                            height: 48,
                                                            fontSize: '1.5rem',
                                                            transition: 'all 0.3s ease',
                                                            boxShadow: `0 4px 12px ${app.color}40`
                                                        }}>
                                                            {app.icon}
                                                        </Avatar>
                                                        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, flex: 1 }}>
                                                            {app.name}
                                                        </Typography>
                                                    </Box>
                                                    <Tooltip title={app.description} arrow placement="bottom">
                                                        <Typography variant="body2" color="text.secondary" sx={{
                                                            lineHeight: 1.6,
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 3,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            mb: 2,
                                                            cursor: 'help'
                                                        }}>
                                                            {app.description}
                                                        </Typography>
                                                    </Tooltip>
                                                </CardContent>
                                                <CardActions sx={{ px: 3, pb: 3, mt: 'auto' }}>
                                                    <Button
                                                        className="launch-btn"
                                                        variant="contained"
                                                        fullWidth
                                                        endIcon={<ArrowForwardIosIcon sx={{ fontSize: '0.9rem !important' }} />}
                                                        sx={{
                                                            borderRadius: 2,
                                                            py: 1.2,
                                                            fontWeight: 700,
                                                            textTransform: 'none',
                                                            bgcolor: app.color,
                                                            boxShadow: `0 4px 10px ${app.color}30`,
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                    >
                                                        Launch App
                                                    </Button>
                                                </CardActions>
                                            </CardActionArea>
                                        </Card>
                                    </Tooltip>
                                </Box>
                            ))}
                    </Box>
                </Box>
            ))}
        </Box>
    );
}
