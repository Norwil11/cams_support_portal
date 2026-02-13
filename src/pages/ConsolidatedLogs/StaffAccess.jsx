import { Box } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import LogTable from './LogTable';

export default function StaffAccess() {
    const { data: logs = [], isLoading, isError, error } = useQuery({
        queryKey: ['staffAccessLogs'],
        queryFn: api.getStaffAccessLogs
    });

    return (
        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <LogTable
                title="Staff Access Logs"
                type="staff-access"
                data={logs}
                isLoading={isLoading}
                isError={isError}
                error={error}
            />
        </Box>
    );
}
