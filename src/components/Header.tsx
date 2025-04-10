
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  ClipboardCheck, 
  BookOpen, 
  Settings
} from 'lucide-react';
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
    if (tab === 'projects' || tab === 'missions') {
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
    <header className="bg-[#141F2A] fixed top-0 left-0 right-0 z-50">
      <div className="container flex justify-between items-center h-[60px]">
        <div className="flex items-center">
          <div className="text-xl font-bold mr-8">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-aqua to-teal-400">
              action.it
            </span>
          </div>
        </div>
        
        <nav className="flex space-x-6 transition-all">
          <button
            className={`py-4 px-6 flex items-center ${
              activeTab === 'chat' ? 'text-purple-400' : 'text-[#CBD5E1]'
            } hover:bg-[#1C2A3A] transition-colors`}
            onClick={() => handleTabChange('chat')}
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            ActionBot
          </button>
          
          <button
            className={`py-4 px-6 flex items-center ${
              activeTab === 'projects' ? 'text-green-400' : 'text-[#CBD5E1]'
            } hover:bg-[#1C2A3A] transition-colors`}
            onClick={() => handleTabChange('projects')}
          >
            <ClipboardCheck className="h-5 w-5 mr-2" />
            Missions
          </button>
          
          <button
            className={`py-4 px-6 flex items-center ${
              activeTab === 'mindboard' ? 'text-blue-400' : 'text-[#CBD5E1]'
            } hover:bg-[#1C2A3A] transition-colors`}
            onClick={() => handleTabChange('mindboard')}
          >
            <BookOpen className="h-5 w-5 mr-2" />
            Mindboard
          </button>
          
          <button
            className={`py-4 px-6 flex items-center ${
              activeTab === 'settings' ? 'text-orange-400' : 'text-[#CBD5E1]'
            } hover:bg-[#1C2A3A] transition-colors`}
            onClick={() => handleTabChange('settings')}
          >
            <Settings className="h-5 w-5 mr-2" />
            Control Deck
          </button>
        </nav>
        
        <div className="flex items-center">
          <div className="text-sm font-medium text-orange-400 mr-4">
            v1.0.0
          </div>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
