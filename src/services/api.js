import axios from 'axios';

const getApiUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    // If VITE_API_URL is provided and is NOT localhost, use it
    if (envUrl && !envUrl.includes('localhost')) return envUrl;

    // Otherwise, dynamically detect current hostname (e.g., 10.10.2.96)
    // and route to the backend port (3000)
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    return `http://${hostname}:3000/api`;
};

const API_URL = getApiUrl();

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for global error handling
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        let message = 'An unexpected error occurred';
        if (error.response) {
            const data = error.response.data;
            if (data.details && Array.isArray(data.details)) {
                message = data.details.map(d => d.message || d.error).filter(Boolean).join(', ');
            } else {
                message = data.message || data.error || message;
            }
        } else if (error.request) {
            message = 'Connection refused: Backend server might be offline.';
        }
        return Promise.reject(new Error(message));
    }
);

export const api = {
    getReport: (params) => apiClient.get('/monthly-report', { params }),
    getDailyReport: (params) => apiClient.get('/daily-report', { params }),
    getClientTracker: (refNo) => apiClient.get('/client-tracker', { params: { refNo } }),
    searchContact: (number) => apiClient.get('/contact-search', { params: { number } }),
    getIncharges: () => apiClient.get('/incharges'),
    submitLog: (data) => apiClient.post('/support-logs', data),

    // Retrieval functions
    getStaffAccessLogs: () => apiClient.get('/support-logs/staff-access'),
    getCamsAdjustmentLogs: () => apiClient.get('/support-logs/cams-adjustment'),
    getCamsReopenLogs: () => apiClient.get('/support-logs/cams-reopen'),
    getDailyCamsLogs: () => apiClient.get('/support-logs/daily-concerns'),
    updateLog: (type, id, data) => apiClient.put(`/support-logs/${type}/${id}`, data),
};

export default apiClient;
