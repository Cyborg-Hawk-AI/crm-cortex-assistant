import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, BookOpen, Settings, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  // Add shadow when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const goToHome = () => {
    navigate('/');
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`sticky top-0 z-50 w-full px-4 py-2.5 bg-gradient-to-r from-[#1C2A3A] via-[#25384D] to-[#F97316]/20 border-b ${
        scrolled ? 'shadow-md shadow-orange-500/10' : ''
      } transition-all duration-200`}
    >
      <div className="container flex items-center justify-between">
        <div 
          className="flex items-center space-x-2 cursor-pointer" 
          onClick={goToHome}
        >
          <div className="bg-gradient-to-r from-neon-aqua to-orange-500 p-1.5 rounded-lg shadow-[0_0_8px_rgba(249,115,22,0.5)]">
            <img 
              src="/lovable-uploads/77879c85-0b1a-4e2f-9b77-3d136c32a6d6.png" 
              alt="Action.it Logo" 
              className="h-5 w-5"
            />
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-neon-aqua to-orange-500">action.it</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList className="grid grid-cols-4 w-auto bg-[#1C2A3A]/70">
            <TabsTrigger 
              value="chat" 
              className="flex items-center gap-1.5 px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple/20 data-[state=active]:to-neon-purple/5 data-[state=active]:text-neon-purple data-[state=active]:shadow-[0_0_8px_rgba(168,85,247,0.3)]"
            >
              <MessageSquare className="h-4 w-4 text-neon-purple" />
              <span className="hidden sm:inline">ActionBot</span>
            </TabsTrigger>
            <TabsTrigger 
              value="tasks" 
              className="flex items-center gap-1.5 px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-green/20 data-[state=active]:to-neon-green/5 data-[state=active]:text-neon-green data-[state=active]:shadow-[0_0_8px_rgba(182,255,93,0.3)]"
            >
              <CheckSquare className="h-4 w-4 text-neon-green" />
              <span className="hidden sm:inline">Missions</span>
            </TabsTrigger>
            <TabsTrigger 
              value="mindboard" 
              className="flex items-center gap-1.5 px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-blue/20 data-[state=active]:to-neon-blue/5 data-[state=active]:text-neon-blue data-[state=active]:shadow-[0_0_8px_rgba(56,189,248,0.3)]"
            >
              <BookOpen className="h-4 w-4 text-neon-blue" />
              <span className="hidden sm:inline">Mindboard</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center gap-1.5 px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/20 data-[state=active]:to-orange-500/5 data-[state=active]:text-orange-500 data-[state=active]:shadow-[0_0_8px_rgba(249,115,22,0.3)]"
            >
              <Settings className="h-4 w-4 text-orange-500" />
              <span className="hidden sm:inline">Control Deck</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="text-xs font-medium bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 hover:text-orange-300">
            v1.0.0
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
