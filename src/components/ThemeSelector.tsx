
import { Check, Settings } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const themes = [
  { id: 'light', name: 'Light Mode', description: 'Clean, modern light theme' },
  { id: 'natural', name: 'Natural Light', description: 'Soft, nature-inspired tones' },
  { id: 'steel', name: 'Steel Blue', description: 'Our signature futuristic look' },
  { id: 'midnight', name: 'Midnight', description: 'Deep, dark, and focused' },
  { id: 'vibrant', name: 'Vibrant', description: 'Bold and energetic' },
] as const;

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent">
          <Settings className="h-5 w-5" />
          <span>Theme</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Choose Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themes.map(({ id, name, description }) => (
          <DropdownMenuItem
            key={id}
            onClick={() => setTheme(id as any)}
            className="flex items-center justify-between"
          >
            <div>
              <div className="font-medium">{name}</div>
              <div className="text-sm text-muted-foreground">{description}</div>
            </div>
            {theme === id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
