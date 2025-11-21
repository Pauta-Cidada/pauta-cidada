import Dashboard from '@/pages/Dashboard';
import News from '@/pages/News';
import NotFound from '@/pages/NotFound';
import Report from '@/pages/Report';
import { Navigate, Route, Routes } from 'react-router';

export default function AppRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/news" element={<News />} />
      <Route path="/report" element={<Report />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
