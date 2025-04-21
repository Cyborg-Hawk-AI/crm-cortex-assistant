
// Theme switcher with Light and Dark Mode
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-md text-foreground">
      <button
        className={`flex items-center gap-2 px-2 py-1 rounded transition-colors ${theme === 'light' ? 'bg-secondary text-secondary-foreground font-bold shadow' : 'hover:bg-muted/40 opacity-60'}`}
        aria-label="Switch to light mode"
        onClick={() => setTheme('light')}
        type="button"
      >
        <Sun className="h-5 w-5" />
        <span>Light Mode</span>
      </button>
      <button
        className={`flex items-center gap-2 px-2 py-1 rounded transition-colors ${theme === 'dark' ? 'bg-secondary text-secondary-foreground font-bold shadow' : 'hover:bg-muted/40 opacity-60'}`}
        aria-label="Switch to dark mode"
        onClick={() => setTheme('dark')}
        type="button"
      >
        <Moon className="h-5 w-5" />
        <span>Dark Mode</span>
      </button>
    </div>
  );
}
