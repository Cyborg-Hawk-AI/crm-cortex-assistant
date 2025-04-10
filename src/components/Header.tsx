
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Grid3X3, 
  Home, 
  MessageSquare, 
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/UserMenu';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // Update route based on the tab
    if (tab === 'projects') {
      navigate('/projects');
    } else if (tab === 'mindboard') {
      navigate('/mindboard');
    } else if (tab === 'main' && location.pathname !== '/') {
      navigate('/');
    } else if (tab === 'settings') {
      // Navigate to settings when implemented
    } else if (tab === 'chat') {
      // Navigate to chat when implemented
    }
  };
  
  return (
    <header className="border-b border-gray-800 bg-[#141F2A]/95 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
      <div className="container flex justify-between items-center h-[60px]">
        <div className="flex items-center">
          <div className="text-xl font-bold mr-6 bg-clip-text text-transparent bg-gradient-to-r from-neon-aqua to-neon-purple">
            Action<span className="text-neon-aqua">it</span>
          </div>
          
          <nav className="flex space-x-1 transition-all">
            <Button
              variant="ghost"
              size="sm"
              className={`hover:bg-[#25384D] ${
                activeTab === 'main' ? 'bg-[#25384D] text-neon-aqua' : 'text-[#CBD5E1]'
              }`}
              onClick={() => handleTabChange('main')}
            >
              <Home className="h-4 w-4 mr-1" />
              Home
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={`hover:bg-[#25384D] ${
                activeTab === 'projects' ? 'bg-[#25384D] text-neon-aqua' : 'text-[#CBD5E1]'
              }`}
              onClick={() => handleTabChange('projects')}
            >
              <Grid3X3 className="h-4 w-4 mr-1" />
              Projects
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={`hover:bg-[#25384D] ${
                activeTab === 'mindboard' ? 'bg-[#25384D] text-neon-aqua' : 'text-[#CBD5E1]'
              }`}
              onClick={() => handleTabChange('mindboard')}
            >
              <BookOpen className="h-4 w-4 mr-1" />
              Mindboard
            </Button>
          </nav>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className={`hover:bg-[#25384D] ${
              activeTab === 'chat' ? 'bg-[#25384D] text-neon-aqua' : 'text-[#CBD5E1]'
            }`}
            onClick={() => handleTabChange('chat')}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            ActionBot
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className={`hover:bg-[#25384D] ${
              activeTab === 'settings' ? 'bg-[#25384D] text-neon-aqua' : 'text-[#CBD5E1]'
            }`}
            onClick={() => handleTabChange('settings')}
          >
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
          
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
