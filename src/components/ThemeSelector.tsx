
// Theme switcher with JUST Light and Dark Mode!
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-md text-[#264E46]">
      <button
        className={`flex items-center gap-2 px-2 py-1 rounded transition-colors ${theme === 'light' ? 'bg-[#C1EDEA]/70 font-bold shadow' : 'hover:bg-[#ECEAE3]/40 opacity-60'}`}
        aria-label="Switch to light mode"
        disabled={theme === 'light'}
        onClick={() => setTheme('light')}
        type="button"
      >
        <Sun className="h-5 w-5" />
        <span>Light Mode</span>
      </button>
      <button
        className={`flex items-center gap-2 px-2 py-1 rounded transition-colors ${theme === 'dark' ? 'bg-[#264E46]/80 text-[#C1EDEA] font-bold shadow' : 'hover:bg-[#C1EDEA]/30 opacity-60'}`}
        aria-label="Switch to dark mode"
        disabled={theme === 'dark'}
        onClick={() => setTheme('dark')}
        type="button"
      >
        <Moon className="h-5 w-5" />
        <span>Dark Mode</span>
      </button>
    </div>
  );
}
