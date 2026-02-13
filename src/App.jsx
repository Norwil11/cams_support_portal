import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import MonthlySaveReport from './pages/Reports/MonthlySaveReport';
import DailySaveReport from './pages/Reports/DailySaveReport';
import ClientTracker from './pages/Clients/ClientTracker';
import ContactSearch from './pages/Clients/ContactSearch';
import SupportLogs from './pages/Support/SupportLogs';
import DashboardvsFS from './pages/Reports/DashboardvsFS';

// Consolidated Logs Components
import ConsolidatedLogsLayout from './pages/ConsolidatedLogs/Layout';
import ConsolidatedLogsHome from './pages/ConsolidatedLogs/Home';
import StaffAccess from './pages/ConsolidatedLogs/StaffAccess';
import CamsAdjustment from './pages/ConsolidatedLogs/CamsAdjustment';
import CamsReopen from './pages/ConsolidatedLogs/CamsReopen';
import DailyCamsConcerns from './pages/ConsolidatedLogs/DailyCamsConcerns';

import ResourceDirectory from './pages/ResourceDirectory';
import { CssBaseline } from '@mui/material';
import { ColorModeProvider } from './theme/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  return (
    <ColorModeProvider>
      <NotificationProvider>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<MonthlySaveReport />} />
              <Route path="daily" element={<DailySaveReport />} />
              <Route path="client-tracker" element={<ClientTracker />} />
              <Route path="contact-search" element={<ContactSearch />} />
              <Route path="support-logs" element={<SupportLogs />} />
              <Route path="dashboard-vs-fs" element={<DashboardvsFS />} />

              {/* Nested Consolidated Logs Routes */}
              <Route path="consolidated-logs" element={<ConsolidatedLogsLayout />}>
                <Route index element={<ConsolidatedLogsHome />} />
                <Route path="staff-access" element={<StaffAccess />} />
                <Route path="cams-adjustment" element={<CamsAdjustment />} />
                <Route path="cams-reopen" element={<CamsReopen />} />
                <Route path="daily-concerns" element={<DailyCamsConcerns />} />
              </Route>

              <Route path="resources" element={<ResourceDirectory />} />
            </Route>
          </Routes>
        </Router>
      </NotificationProvider>
    </ColorModeProvider>
  )
}

export default App
