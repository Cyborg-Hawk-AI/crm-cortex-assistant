import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, MessageCircle, ListChecks, LayoutDashboard, BrainCircuit, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotionSync } from '@/components/NotionSync';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You've been signed out of your account",
      });
      navigate('/login');
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign out failed",
        description: "There was a problem signing you out",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-[#25384D] border-b border-[#3A4D62] h-16 flex items-center justify-between px-4">
      <div className="flex items-center space-x-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant={activeTab === "main" ? "default" : "ghost"}
            onClick={() => setActiveTab("main")}
            data-tab="main"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Command View
          </Button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant={activeTab === "tasks" ? "default" : "ghost"}
            onClick={() => setActiveTab("tasks")}
            data-tab="tasks"
          >
            <ListChecks className="mr-2 h-4 w-4" />
            Missions
          </Button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant={activeTab === "mindboard" ? "default" : "ghost"}
            onClick={() => setActiveTab("mindboard")}
            data-tab="mindboard"
          >
            <BrainCircuit className="mr-2 h-4 w-4" />
            Mindboard
          </Button>
        </motion.div>
      </div>

      <div className="flex items-center space-x-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant={activeTab === "chat" ? "default" : "ghost"}
            onClick={() => setActiveTab("chat")}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Chat
          </Button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant={activeTab === "scratchpad" ? "default" : "ghost"}
            onClick={() => setActiveTab("scratchpad")}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Scratchpad
          </Button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant={activeTab === "settings" ? "default" : "ghost"}
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="mr-2 h-4 w-4" />
            Control Deck
          </Button>
        </motion.div>
      </div>
    </header>
  );
}
