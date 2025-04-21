
// Theme switcher with Light and Dark Mode
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-md text-foreground">
      <button
        className={`flex items-center gap-2 px-2 py-1.5 rounded transition-all duration-300 ${
          theme === 'light' 
            ? 'bg-secondary text-secondary-foreground font-bold shadow-md' 
            : 'hover:bg-muted/50 opacity-70'
        }`}
        aria-label="Switch to light mode"
        onClick={() => setTheme('light')}
        type="button"
      >
        <Sun className="h-5 w-5" />
        <span>Light Mode</span>
      </button>
      <button
        className={`flex items-center gap-2 px-2 py-1.5 rounded transition-all duration-300 ${
          theme === 'dark' 
            ? 'bg-accent text-accent-foreground font-bold shadow-[0_0_8px_rgba(0,247,239,0.2)]' 
            : 'hover:bg-muted/50 opacity-70'
        }`}
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
