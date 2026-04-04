import { AppProvider } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-white dark:bg-[#111315] text-gray-700 dark:text-[#8A8E93] font-body flex overflow-hidden selection:bg-[#BDFC51] selection:text-[#111315]">
        <Toaster position="top-right" toastOptions={{ style: { background: '#242730', color: '#fff', border: '1px solid #2C2F36' } }} />
        <Dashboard />
      </div>
    </AppProvider>
  );
}
