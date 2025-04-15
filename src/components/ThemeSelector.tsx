
import { Check, Palette } from 'lucide-react';
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
  { id: 'natural', name: 'Natural Light', description: 'Soft, nature-inspired tones' },
  { id: 'steel', name: 'Steel Blue', description: 'Our signature futuristic look' },
  { id: 'midnight', name: 'Midnight', description: 'Deep, dark, and focused' },
  { id: 'vibrant', name: 'Vibrant', description: 'Bold and energetic' },
] as const;

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="flex items-center">
      <Palette className="mr-2 h-4 w-4" />
      <span>Theme</span>
      {theme !== 'steel' && (
        <div className="ml-auto">
          <div className="h-4 w-4 rounded-full border border-[#3A4D62]" 
               style={{ background: theme === 'midnight' ? '#171C24' : '#4A1FA7' }} 
          />
        </div>
      )}
    </div>
  );
}
