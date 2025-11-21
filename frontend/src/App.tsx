import { BrowserRouter } from 'react-router';
import { Toaster } from '@/components/ui/sonner';
import { CopyProvider } from './context/CopyContext';
import AppRoutes from './routes';

function App() {
  return (
    <BrowserRouter>
      <CopyProvider>
        <AppRoutes />
        <Toaster />
      </CopyProvider>
    </BrowserRouter>
  );
}

export default App;
