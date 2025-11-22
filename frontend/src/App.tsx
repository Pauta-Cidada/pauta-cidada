import { BrowserRouter } from 'react-router';
import { Toaster } from '@/components/ui/sonner';
import ScrollToTop from '@/components/ScrollToTop';
import { CopyProvider } from './context/CopyContext';
import AppRoutes from './routes';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <CopyProvider>
        <AppRoutes />
        <Toaster />
      </CopyProvider>
    </BrowserRouter>
  );
}

export default App;
