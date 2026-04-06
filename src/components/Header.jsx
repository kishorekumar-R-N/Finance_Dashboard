import { Moon, Sun, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Header() {
  const { role, setRole, darkMode, setDarkMode } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-ink-950/80 backdrop-blur-md border-b border-ink-100 dark:border-ink-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-ink-900 dark:bg-white rounded-lg flex items-center justify-center">
            <span className="text-white dark:text-ink-900 text-xs font-display font-bold">L</span>
          </div>
          <span className="font-display font-semibold text-ink-900 dark:text-ink-100 tracking-tight">
            FINDAS
          </span>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Role switcher */}
          <div className="relative">
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 text-xs font-medium rounded-xl 
                         bg-ink-100 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 
                         text-ink-700 dark:text-ink-300 cursor-pointer 
                         focus:outline-none focus:ring-2 focus:ring-ink-400"
            >
              <option value="viewer">👁 Viewer</option>
              <option value="admin">⚡ Admin</option>
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
          </div>

          {/* Role badge */}
          <span className={`hidden sm:inline text-xs font-medium px-2 py-1 rounded-lg ${
            role === 'admin'
              ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
              : 'bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-400'
          }`}>
            {role === 'admin' ? 'Admin Mode' : 'View Only'}
          </span>

          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(d => !d)}
            className="w-8 h-8 flex items-center justify-center rounded-xl 
                       bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-400 
                       hover:bg-ink-200 dark:hover:bg-ink-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>
    </header>
  );
}
