import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  ClipboardCheck, 
  BookOpen, 
  Settings,
  Menu
} from 'lucide-react';
import { UserMenu } from '@/components/UserMenu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

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
  
  // Track window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Determine if we should show labels or icons only
  const showLabels = windowWidth > 768;
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    
    // Update route based on the tab
    if (tab === 'projects' || tab === 'missions') {
      navigate('/projects');
    } else if (tab === 'mindboard') {
      navigate('/mindboard');
    } else if (tab === 'main' && location.pathname !== '/') {
      navigate('/', { state: { activeTab: 'main' } });
    } else if (tab === 'settings') {
      navigate('/', { state: { activeTab: 'settings' } });
    } else if (tab === 'chat') {
      navigate('/', { state: { activeTab: 'chat' } });
    }
  };
  
  const navItems = [
    {
      id: 'chat',
      label: 'ActionBot',
      icon: <MessageSquare className="h-5 w-5" />,
      activeColor: 'text-purple-400'
    },
    {
      id: 'projects',
      label: 'Missions',
      icon: <ClipboardCheck className="h-5 w-5" />,
      activeColor: 'text-green-400'
    },
    {
      id: 'mindboard',
      label: 'Mindboard',
      icon: <BookOpen className="h-5 w-5" />,
      activeColor: 'text-blue-400'
    },
    {
      id: 'settings',
      label: 'Control Deck',
      icon: <Settings className="h-5 w-5" />,
      activeColor: 'text-orange-400'
    }
  ];
  
  return (
    <header className="bg-[#141F2A] fixed top-0 left-0 right-0 z-50">
      <div className="container flex justify-between items-center h-[60px]">
        <div className="flex items-center">
          <div 
            className="text-xl font-bold mr-8 cursor-pointer"
            onClick={() => handleTabChange('main')}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-aqua to-teal-400">
              action.it
            </span>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        {!isMobile && (
          <nav className="hidden md:flex space-x-2 transition-all">
            {navItems.map(item => (
              <button
                key={item.id}
                className={`py-4 px-3 lg:px-6 flex items-center justify-center transition-all duration-300 ${
                  activeTab === item.id ? item.activeColor : 'text-[#CBD5E1]'
                } hover:bg-[#1C2A3A]`}
                onClick={() => handleTabChange(item.id)}
              >
                {item.icon}
                {showLabels && <span className="ml-2">{item.label}</span>}
              </button>
            ))}
          </nav>
        )}
        
        {/* Mobile Navigation */}
        {isMobile && (
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5 text-[#CBD5E1]" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-[#141F2A] border-r border-[#3A4D62] pt-12">
              <nav className="flex flex-col space-y-2">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    className={`py-3 px-4 flex items-center ${
                      activeTab === item.id ? item.activeColor : 'text-[#CBD5E1]'
                    } hover:bg-[#1C2A3A] rounded-md transition-colors`}
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
        
        <div className="flex items-center">
          <div className="text-sm font-medium text-orange-400 mr-4 hidden sm:block">
            v1.0.0
          </div>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
