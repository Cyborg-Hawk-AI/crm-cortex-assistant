import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut } from 'lucide-react';
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

interface IndexProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export default function Index({ activeTab: propActiveTab, setActiveTab: propSetActiveTab }: IndexProps) {
  const [localActiveTab, setLocalActiveTab] = useState<string>('main');
  const { signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const activeTab = propActiveTab || localActiveTab;
  const setActiveTab = propSetActiveTab || setLocalActiveTab;
  const previousTabRef = useRef<string | null>(null);
  
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskEditorOpen, setIsTaskEditorOpen] = useState(false);
  const [openCreateTask, setOpenCreateTask] = useState(false);
  
  const pendingNavigationRef = useRef<{
    timestamp: number, 
    target: string, 
    processed: boolean,
    attempts: number
  } | null>(null);
  
  const navigationHistoryRef = useRef<{
    timestamp: number,
    action: string,
    from: string,
    to: string,
    state: any
  }[]>([]);
  
  const pendingConversationIdRef = useRef<string | null>(null);
  
  useEffect(() => {
    console.log(`🏗️ Index: Page loaded/rerendered with activeTab=${activeTab}`);
    console.log(`📊 Index: Location state:`, location.state);
    
    navigationHistoryRef.current.push({
      timestamp: Date.now(),
      action: 'render',
      from: previousTabRef.current || 'initial',
      to: activeTab,
      state: location.state
    });
    
    if (navigationHistoryRef.current.length > 10) {
      navigationHistoryRef.current.shift();
    }
  }, [activeTab, location]);

  useEffect(() => {
    const state = location.state as { 
      openTaskId?: string;
      activeTab?: string;
      openCreateTask?: boolean;
      forceReload?: number;
      newConversationId?: string;
      pendingConversationId?: string;
    } | null;
    
    console.log("📊 Index: Location state changed:", state);
    
    if (state?.pendingConversationId || state?.newConversationId) {
      const conversationId = state.pendingConversationId || state.newConversationId;
      console.log(`🔄 Index: Detected pending conversation ID: ${conversationId}`);
      pendingConversationIdRef.current = conversationId;
    }
    
    if (state?.activeTab && state?.activeTab !== activeTab) {
      console.log(`🔄 Index: Setting active tab to ${state.activeTab} from ${activeTab}`);
      
      pendingNavigationRef.current = {
        timestamp: Date.now(),
        target: state.activeTab,
        processed: false,
        attempts: (pendingNavigationRef.current?.target === state.activeTab ? 
                  (pendingNavigationRef.current.attempts + 1) : 1)
      };
      
      setActiveTab(state.activeTab);
      
      if (pendingNavigationRef.current) {
        pendingNavigationRef.current.processed = true;
      }
      
      if (state?.activeTab === 'chat') {
        const newState = { ...state };
        
        if (pendingConversationIdRef.current) {
          newState.pendingConversationId = pendingConversationIdRef.current;
          console.log(`🔄 Index: Preserving conversation ID ${pendingConversationIdRef.current} in state during navigation`);
        }
        
        delete newState.activeTab;
        navigate(location.pathname, { replace: true, state: newState });
      } else {
        navigate(location.pathname, { replace: true });
      }
      
      console.log(`✅ Index: Tab change to ${state.activeTab} completed`);
    }
    
    if (state?.openTaskId) {
      setSelectedTaskId(state.openTaskId);
      setIsTaskEditorOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
    
    if (state?.openCreateTask) {
      setOpenCreateTask(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, setActiveTab, activeTab]);
  
  useEffect(() => {
    if (previousTabRef.current !== activeTab) {
      console.log(`🔄 Index: Tab changed from ${previousTabRef.current || 'initial'} to ${activeTab}`);
      previousTabRef.current = activeTab;
      
      if (activeTab === 'chat' && pendingConversationIdRef.current) {
        console.log(`🔄 Index: We're on chat tab with pending conversation ID: ${pendingConversationIdRef.current}`);
      }
    }
  }, [activeTab]);

  const handleOpenChat = () => {
    console.log("🔍 Index: handleOpenChat called - setting tab to chat");
    setActiveTab('chat');
  };

  const handleOpenScratchpad = () => {
    setActiveTab('scratchpad');
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

  const handleCloseTaskEditor = () => {
    setIsTaskEditorOpen(false);
  };

  const renderStateDebugger = () => {
    if (process.env.NODE_ENV !== 'production') {
      return (
        <div className="bg-slate-900 text-xs p-2 rounded-md text-slate-300 mb-2">
          <div>Current Tab: {activeTab}</div>
          <div>Previous Tab: {previousTabRef.current}</div>
          <div>Location Path: {location.pathname}</div>
          <div>Location State: {JSON.stringify(location.state)}</div>
          <div>Pending Conv ID: {pendingConversationIdRef.current || 'none'}</div>
          <div>Pending Nav: {pendingNavigationRef.current ? 
            `${pendingNavigationRef.current.target} (processed: ${pendingNavigationRef.current.processed}, attempts: ${pendingNavigationRef.current.attempts})` : 'none'}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1C2A3A] text-[#F1F5F9]">
      {renderStateDebugger()}
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

              <StatusOverview />

              <div className="space-y-4">
                <TodaySyncUps />
                
                <RecentTickets onTaskClick={(taskId) => {
                  navigate('/missions', { state: { openTaskId: taskId } });
                }} />
                
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
              <ChatLayout key={`chat-${pendingConversationIdRef.current || 'default'}-${(location.state as any)?.forceReload || 'default'}`} />
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
