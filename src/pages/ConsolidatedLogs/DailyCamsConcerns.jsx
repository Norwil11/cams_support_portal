import { Box } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import LogTable from './LogTable';

export default function DailyCamsConcerns() {
    const { data: logs = [], isLoading, isError, error } = useQuery({
        queryKey: ['dailyCamsLogs'],
        queryFn: api.getDailyCamsLogs
    });

    return (
        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <LogTable
                title="Daily CAMS Concern Logs"
                type="daily-concerns"
                data={logs}
                isLoading={isLoading}
                isError={isError}
                error={error}
            />
        </Box>
    );
}
