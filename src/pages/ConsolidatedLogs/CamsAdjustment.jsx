import { Box } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import LogTable from './LogTable';

export default function CamsAdjustment() {
    const { data: logs = [], isLoading, isError, error } = useQuery({
        queryKey: ['camsAdjustmentLogs'],
        queryFn: api.getCamsAdjustmentLogs
    });

    return (
        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <LogTable
                title="CAMS Adjustment Logs"
                type="cams-adjustment"
                data={logs}
                isLoading={isLoading}
                isError={isError}
                error={error}
            />
        </Box>
    );
}
