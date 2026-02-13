import { Outlet } from 'react-router-dom';
import { Box, Typography, Paper } from '@mui/material';

export default function ConsolidatedLogsLayout() {
    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* You could put a sub-header here if needed */}
            <Outlet />
        </Box>
    );
}
