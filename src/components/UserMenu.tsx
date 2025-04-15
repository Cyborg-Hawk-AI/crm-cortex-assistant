
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut, Settings, Palette, Check } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';

const themes = [
  { id: 'natural', name: 'Natural Light', description: 'Soft, nature-inspired tones' },
  { id: 'steel', name: 'Steel Blue (Default)', description: 'Our signature futuristic look' },
  { id: 'midnight', name: 'Midnight', description: 'Deep, dark, and focused' },
  { id: 'vibrant', name: 'Vibrant', description: 'Bold and energetic' }
] as const;

export function UserMenu() {
  const { signOut } = useAuth();
  const { profile, loading } = useProfile();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const handleThemeChange = (newTheme: 'steel' | 'midnight' | 'vibrant') => {
    if (theme === newTheme) return; // Skip if theme is already selected
    
    console.log(`Changing theme from ${theme} to ${newTheme}`);
    setTheme(newTheme);
    
    toast({
      title: "Theme Updated",
      description: `Switched to ${themes.find(t => t.id === newTheme)?.name}`,
    });
  };

  if (loading) {
    return (
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-primary/10">...</AvatarFallback>
      </Avatar>
    );
  }

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="p-0 h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {profile?.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={profile?.full_name || ''} />
            ) : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile?.full_name || 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">{profile?.email || ''}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette className="mr-2 h-4 w-4" />
            <span>Theme</span>
            {theme !== 'steel' && (
              <div className="ml-auto">
                <div 
                  className="h-4 w-4 rounded-full border border-[#3A4D62]" 
                  style={{ 
                    background: theme === 'midnight' ? '#171C24' : '#4A1FA7'
                  }} 
                />
              </div>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuLabel className="font-normal">
              <span className="block text-xs text-muted-foreground">
                Select a theme
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {themes.map((t) => (
              <DropdownMenuItem
                key={t.id}
                onClick={() => handleThemeChange(t.id)}
              >
                <div className="flex items-center justify-between w-full">
                  <div>
                    <p className="text-sm font-medium leading-none mb-1">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.description}</p>
                  </div>
                  {theme === t.id && <Check className="h-4 w-4 ml-2" />}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
