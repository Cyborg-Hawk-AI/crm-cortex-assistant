
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
  { id: 'light', name: 'Teal Light', description: 'Clean, modern teal/green theme' },
  { id: 'natural', name: 'Natural Light', description: 'Soft, nature-inspired tones' },
  { id: 'steel', name: 'Steel Blue', description: 'Classic blue business look' },
  { id: 'midnight', name: 'Midnight', description: 'Deep, dark, and focused' },
  { id: 'vibrant', name: 'Vibrant', description: 'Bold and energetic' },
] as const;

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[#F2FCE2] text-[#264E46] hover:text-[#88D9CE] transition-colors">
          <Settings className="h-5 w-5" />
          <span>Theme</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border-[#C1EDEA] bg-white shadow-[0_0_15px_rgba(136,217,206,0.15)]">
        <DropdownMenuLabel className="text-[#264E46]">Choose Theme</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#C1EDEA]/50" />
        {themes.map(({ id, name, description }) => (
          <DropdownMenuItem
            key={id}
            onClick={() => setTheme(id as any)}
            className="flex items-center justify-between hover:bg-[#F2FCE2] cursor-pointer"
          >
            <div>
              <div className="font-medium text-[#264E46]">{name}</div>
              <div className="text-sm text-[#A8A29E]">{description}</div>
            </div>
            {theme === id && <Check className="h-4 w-4 text-[#88D9CE]" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
