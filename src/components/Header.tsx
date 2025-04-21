
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  ClipboardCheck, 
  BookOpen, 
  Settings,
  Menu,
  LayoutDashboard
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { UserMenu } from '@/components/UserMenu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/contexts/ThemeContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme } = useTheme();
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const showLabels = windowWidth > 768;
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    
    if (tab === 'projects') {
      navigate('/projects');
    } else if (tab === 'notebooks') {
      navigate('/mindboard');
    } else if (tab === 'main' || tab === 'dashboard') {
      navigate('/');
      setTimeout(() => {
        setActiveTab('main');
      }, 100);
    } else if (tab === 'settings') {
      navigate('/');
      setTimeout(() => {
        setActiveTab('settings');
      }, 100);
    } else if (tab === 'chat') {
      navigate('/');
      setTimeout(() => {
        setActiveTab('chat');
      }, 100);
    }
  };
  
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      activeColor: theme === 'dark' ? 'text-neon-aqua' : 'text-[#88D9CE]'
    },
    {
      id: 'chat',
      label: 'ActionBot',
      icon: <MessageSquare className="h-5 w-5" />,
      activeColor: theme === 'dark' ? 'text-neon-aqua' : 'text-[#264E46]'
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: <ClipboardCheck className="h-5 w-5" />,
      activeColor: theme === 'dark' ? 'text-neon-aqua' : 'text-[#88D9CE]'
    },
    {
      id: 'notebooks',
      label: 'Notebooks',
      icon: <BookOpen className="h-5 w-5" />,
      activeColor: theme === 'dark' ? 'text-neon-aqua' : 'text-[#88D9CE]'
    },
    {
      id: 'settings',
      label: 'Control Deck',
      icon: <Settings className="h-5 w-5" />,
      activeColor: theme === 'dark' ? 'text-neon-aqua' : 'text-[#264E46]'
    }
  ];
  
  const isDark = theme === 'dark';
  
  return (
    <header className={`fixed top-0 left-0 right-0 z-40 border-b header ${
      isDark ? 'bg-background border-[#1d2730]' : 'bg-white border-[#ECEAE3]'
    }`}>
      <div className="container flex justify-between items-center h-[60px]">
        <div className="flex items-center">
          <Logo className="mr-8" onClick={() => handleTabChange('dashboard')} />
        </div>
        
        {!isMobile && (
          <nav className="hidden md:flex space-x-2 transition-all">
            {navItems.map(item => (
              <button
                key={item.id}
                className={`py-4 px-3 lg:px-6 flex items-center justify-center transition-all duration-300 ${
                  activeTab === item.id ? item.activeColor : isDark ? 'text-foreground' : 'text-[#404040]'
                } ${isDark ? 'hover:bg-muted/70' : 'hover:bg-[#F5F7FA]'}`}
                onClick={() => handleTabChange(item.id)}
              >
                {item.icon}
                {showLabels && <span className="ml-2">{item.label}</span>}
              </button>
            ))}
          </nav>
        )}
        
        {isMobile && (
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className={`h-5 w-5 ${isDark ? 'text-foreground' : 'text-[#404040]'}`} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className={`${isDark ? 'bg-card border-[#1d2730]' : 'bg-white border-[#ECEAE3]'} pt-12`}>
              <nav className="flex flex-col space-y-2">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    className={`py-3 px-4 flex items-center ${
                      activeTab === item.id ? item.activeColor : isDark ? 'text-foreground' : 'text-[#404040]'
                    } ${isDark ? 'hover:bg-muted/70' : 'hover:bg-[#F5F7FA]'} rounded-md transition-colors`}
                    onClick={() => handleTabChange(item.id)}
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        )}
        
        <div className="flex items-center gap-4">
          <div className={`text-xs font-medium ${isDark ? 'text-muted-foreground/70' : 'text-[#A8A29E]'} hidden sm:block`}>
            v1.0.0
          </div>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
