import Dashboard from '@/pages/Dashboard';
import News from '@/pages/News';
import NotFound from '@/pages/NotFound';
import Report from '@/pages/Report';
import { Layout } from '@/components/Layout';
import { Navigate, Route, Routes } from 'react-router';

export default function AppRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="/dashboard" replace />} />

      <Route
        path="/dashboard"
        element={
          <Layout>
            <Dashboard />
          </Layout>
        }
      />

      <Route
        path="/noticia/:id"
        element={
          <Layout>
            <News />
          </Layout>
        }
      />

      <Route
        path="/report"
        element={
          <Layout>
            <Report />
          </Layout>
        }
      />

      <Route
        path="*"
        element={
          <Layout>
            <NotFound />
          </Layout>
        }
      />
    </Routes>
  );
}
