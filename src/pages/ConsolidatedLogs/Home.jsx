import { Typography, Paper } from '@mui/material';

export default function ConsolidatedLogsHome() {
    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Logs Consolidated
            </Typography>
            <Typography>
                Please select a log type from the navigation menu on the left.
            </Typography>
        </Paper>
    );
}
