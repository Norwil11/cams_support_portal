import { Box } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import LogTable from './LogTable';

export default function CamsReopen() {
    const { data: logs = [], isLoading, isError, error } = useQuery({
        queryKey: ['camsReopenLogs'],
        queryFn: api.getCamsReopenLogs
    });

    return (
        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <LogTable
                title="CAMS Reopen & Devs Adjustment Logs"
                type="cams-reopen"
                data={logs}
                isLoading={isLoading}
                isError={isError}
                error={error}
            />
        </Box>
    );
}
