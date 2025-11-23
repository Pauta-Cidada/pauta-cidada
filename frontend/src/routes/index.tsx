import Dashboard from '@/pages/Dashboard';
import News from '@/pages/News';
import NotFound from '@/pages/NotFound';
import { Layout } from '@/components/Layout';
import { Navigate, Route, Routes } from 'react-router';
import About from '@/pages/About';

export default function AppRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="/noticias" replace />} />

      <Route
        path="/noticias"
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
        path="/sobre"
        element={
          <Layout>
            <About />
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
