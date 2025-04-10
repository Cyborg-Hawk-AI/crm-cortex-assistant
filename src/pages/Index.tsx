
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, LogOut } from 'lucide-react';
import { Header } from '@/components/Header';
import { ChatLayout } from '@/components/ChatLayout';
import { ScratchpadNotes } from '@/components/ScratchpadNotes';
import { Button } from '@/components/ui/button';
import { NotionSync } from '@/components/NotionSync';
import { HomeButton } from '@/components/HomeButton';
import { StatusOverview } from '@/components/StatusOverview';
import { TodaySyncUps } from '@/components/TodaySyncUps';
import { UpcomingMeetings } from '@/components/UpcomingMeetings';
import { RecentTickets } from '@/components/RecentTickets';
import { RecentMindboardNotes } from '@/components/RecentMindboardNotes';
import { FloatingActionBar } from '@/components/FloatingActionBar';
import { Mindboard } from '@/components/mindboard/Mindboard';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { MissionTaskEditor } from '@/components/mission/MissionTaskEditor';
import { TasksPage } from '@/components/TasksPage';

export default function Index() {
  const [activeTab, setActiveTab] = useState<string>('main');
  const { signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskEditorOpen, setIsTaskEditorOpen] = useState(false);
  const [openCreateTask, setOpenCreateTask] = useState(false);

  // Process location state for navigation and task opening
  useEffect(() => {
    const state = location.state as { 
      openTaskId?: string;
      activeTab?: string;
      openCreateTask?: boolean;
    } | null;
    
    if (state?.openTaskId) {
      setSelectedTaskId(state.openTaskId);
      setIsTaskEditorOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
    
    if (state?.activeTab) {
      setActiveTab(state.activeTab);
      navigate(location.pathname, { replace: true, state: {} });
    }
    
    if (state?.openCreateTask) {
      setOpenCreateTask(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleOpenChat = () => {
    setActiveTab('chat');
  };

  const handleOpenScratchpad = () => {
    setActiveTab('scratchpad');
  };

  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab);

    // Navigate to appropriate route when tab changes
    if (tab === 'missions') {
      navigate('/missions');
    } else if (tab === 'projects') {
      navigate('/projects');
    }
  };
  
  const handleCloseTaskEditor = () => {
    setIsTaskEditorOpen(false);
  };

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

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsTaskEditorOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1C2A3A] text-[#F1F5F9]">
      <Header activeTab={activeTab} setActiveTab={handleSetActiveTab} />

      <main className="flex-1 container py-4 max-w-6xl">
        <AnimatePresence mode="wait">
          {activeTab === 'main' && (
            <motion.div
              key="main"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-1">
                <h1 className="text-2xl font-bold text-[#F1F5F9] bg-clip-text text-transparent bg-gradient-to-r from-neon-aqua to-neon-purple">Command View</h1>
                <Button
                  variant="outline"
                  className="border-neon-aqua/30 hover:border-neon-aqua/50 hover:shadow-[0_0_15px_rgba(0,247,239,0.2)]"
                  onClick={() => window.open('https://notion.so', '_blank')}
                >
                  Open in Notion
                </Button>
              </div>

              {/* Status Overview */}
              <StatusOverview />

              {/* Main Dashboard Content - Reorganized layout */}
              <div className="space-y-4">
                {/* Today's SyncUps (replacing AlertsPanel) */}
                <TodaySyncUps />
                
                {/* Recent Missions */}
                <RecentTickets onTaskClick={(taskId) => {
                  navigate('/missions', { state: { openTaskId: taskId } });
                }} />
                
                {/* Recent Mindboard Notes (was Activity Feed) */}
                <RecentMindboardNotes />
              </div>
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="h-[calc(100vh-120px)] flex flex-col bg-[#25384D]/90 backdrop-blur-sm border border-[#3A4D62] rounded-lg shadow-md overflow-hidden"
            >
              <HomeButton />
              <ChatLayout />
            </motion.div>
          )}

          {activeTab === 'scratchpad' && (
            <motion.div
              key="scratchpad"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-[calc(100vh-120px)] flex flex-col bg-[#25384D]/90 backdrop-blur-sm border border-[#3A4D62] rounded-lg shadow-md overflow-hidden"
            >
              <HomeButton />
              <ScratchpadNotes />
            </motion.div>
          )}

          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-[calc(100vh-120px)] flex flex-col bg-[#25384D]/90 backdrop-blur-sm border border-[#3A4D62] rounded-lg shadow-md overflow-hidden"
            >
              <HomeButton />
              <TasksPage 
                openCreateTask={openCreateTask} 
                setOpenCreateTask={setOpenCreateTask} 
                selectedTaskId={selectedTaskId}
                setSelectedTaskId={setSelectedTaskId}
                isTaskEditorOpen={isTaskEditorOpen}
                setIsTaskEditorOpen={setIsTaskEditorOpen}
              />
            </motion.div>
          )}

          {activeTab === 'mindboard' && (
            <motion.div
              key="mindboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="h-[calc(100vh-120px)] flex flex-col bg-[#25384D]/90 backdrop-blur-sm border border-[#3A4D62] rounded-lg shadow-md overflow-hidden"
            >
              <Mindboard />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="h-[calc(100vh-120px)] flex flex-col items-center justify-center bg-[#25384D]/90 backdrop-blur-sm border border-[#3A4D62] rounded-lg shadow-md p-8 text-center"
            >
              <HomeButton />
              <div className="max-w-md">
                <h2 className="text-2xl font-semibold mb-4 text-[#F1F5F9] bg-clip-text text-transparent bg-gradient-to-r from-neon-aqua to-neon-purple">Control Deck</h2>
                <p className="text-[#CBD5E1] mb-6">
                  Control Deck will be implemented in the next version. Here you'll be able to:
                </p>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-neon-aqua mr-2"></span>
                    Configure Notion integrations
                  </li>
                  <li className="flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-neon-purple mr-2"></span>
                    Set up AI response preferences
                  </li>
                  <li className="flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-neon-aqua mr-2"></span>
                    Manage workspace connections
                  </li>
                  <li className="flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-neon-purple mr-2"></span>
                    Customize UI appearance
                  </li>
                </ul>
                <div className="text-sm text-[#CBD5E1] p-3 rounded-lg bg-[#1C2A3A] border border-[#3A4D62]">
                  Version 1.0.0 • action.it • Notion Assistant
                </div>
                
                <Button 
                  variant="destructive" 
                  className="w-full mt-4"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {activeTab !== 'tasks' && selectedTaskId && (
        <Dialog open={isTaskEditorOpen} onOpenChange={setIsTaskEditorOpen}>
          <DialogContent className="sm:max-w-[700px] p-0 bg-[#25384D] border-[#3A4D62]">
            <MissionTaskEditor 
              taskId={selectedTaskId}
              onClose={handleCloseTaskEditor}
              onRefresh={() => {}}
            />
          </DialogContent>
        </Dialog>
      )}

      {activeTab === 'main' && <FloatingActionBar />}
    </div>
  );
}
