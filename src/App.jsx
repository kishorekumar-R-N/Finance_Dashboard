import { AppProvider } from './context/AppContext';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-white dark:bg-[#111315] text-gray-700 dark:text-[#8A8E93] font-body flex overflow-hidden selection:bg-[#BDFC51] selection:text-[#111315]">
        <Dashboard />
      </div>
    </AppProvider>
  );
}
