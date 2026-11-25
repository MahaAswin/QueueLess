import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';
import { apiClient } from './api/axiosClient';
import { CapacitorBridge } from './components/native/CapacitorBridge';

export function App() {
  useEffect(() => {
    // Proactively wake up backend from Render free-tier sleep on app load
    apiClient.get('/api/health').catch(() => {
      // Ignore background wake-up errors
    });
  }, []);

  return (
    <BrowserRouter>
      <CapacitorBridge />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
