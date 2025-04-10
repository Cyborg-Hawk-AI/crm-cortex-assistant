
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronUp, 
  ChevronDown, 
  Plus, 
  CalendarPlus, 
  ListTodo, 
  BookOpen,
  MoreHorizontal
} from 'lucide-react';
import { Button } from './ui/button';
import { TaskCreateModal } from './modals/TaskCreateModal';
import { MeetingCreateModal } from './modals/MeetingCreateModal';
import { NotebookCreateModal } from './modals/NotebookCreateModal';
import { useMeetings } from '@/hooks/useMeetings';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export function FloatingActionBar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeModal, setActiveModal] = useState<'task' | 'meeting' | 'contact' | 'note' | null>(null);
  const { createMeeting } = useMeetings();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = useIsMobile();
  
  // Track window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Determine display mode based on screen width
  const displayMode = () => {
    if (windowWidth < 640) return 'compact'; // Very small screens - ultra compact
    if (windowWidth < 768) return 'iconOnly'; // Small screens - icons only
    return 'full'; // Larger screens - full buttons with text
  };
  
  const quickActions = [
    {
      id: 'task',
      label: 'New Mission',
      icon: <ListTodo className="h-4 w-4 text-neon-aqua" />,
      className: "bg-gradient-to-r from-neon-aqua/20 to-neon-green/20 text-[#F1F5F9] border-neon-aqua/30 hover:bg-gradient-to-r hover:from-neon-aqua/30 hover:to-neon-green/30 hover:shadow-[0_0_8px_rgba(0,247,239,0.4)]"
    },
    {
      id: 'meeting',
      label: 'New SyncUp',
      icon: <CalendarPlus className="h-4 w-4 text-neon-blue" />,
      className: "bg-gradient-to-r from-neon-blue/20 to-neon-blue/10 text-[#F1F5F9] border-neon-blue/30 hover:bg-gradient-to-r hover:from-neon-blue/30 hover:to-neon-blue/20 hover:shadow-[0_0_8px_rgba(14,165,233,0.4)]"
    },
    {
      id: 'note',
      label: 'New Note',
      icon: <BookOpen className="h-4 w-4 text-neon-purple" />,
      className: "bg-gradient-to-r from-neon-purple/20 to-neon-purple/10 text-[#F1F5F9] border-neon-purple/30 hover:bg-gradient-to-r hover:from-neon-purple/30 hover:to-neon-purple/20 hover:shadow-[0_0_8px_rgba(168,85,247,0.4)]"
    }
  ];

  const handleActionClick = (actionId: 'task' | 'meeting' | 'note') => {
    setActiveModal(actionId);
  };

  return (
    <>
      <motion.div
        initial={{ y: 0, opacity: 1 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-0 left-0 right-0 z-50"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-[#25384D] border border-[#3A4D62] rounded-t-lg shadow-[0_-4px_20px_rgba(0,247,239,0.15)]">
            <div className="flex justify-between items-center p-2 border-b border-[#3A4D62]">
              <h3 className="text-sm font-medium text-[#F1F5F9] ml-2">Quick Actions</h3>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-8 text-[#F1F5F9] hover:text-neon-aqua"
              >
                {isCollapsed ? (
                  <>Expand <ChevronUp className="h-4 w-4 ml-1" /></>
                ) : (
                  <>Collapse <ChevronDown className="h-4 w-4 ml-1" /></>
                )}
              </Button>
            </div>
            
            {/* Quick Action Buttons - Always Visible */}
            <div className="p-3 flex justify-center">
              <div className={`flex ${displayMode() === 'compact' ? 'gap-3' : 'gap-4'} items-center justify-center`}>
                {displayMode() === 'full' ? (
                  // Full view for larger screens
                  quickActions.map(action => (
                    <Button
                      key={action.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleActionClick(action.id as 'task' | 'meeting' | 'note')}
                      className={`h-10 transition-all duration-300 ${action.className}`}
                    >
                      {action.icon} <span className="ml-1">{action.label}</span>
                    </Button>
                  ))
                ) : displayMode() === 'iconOnly' ? (
                  // Icon-only view for small screens
                  <TooltipProvider>
                    {quickActions.map(action => (
                      <Tooltip key={action.id}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleActionClick(action.id as 'task' | 'meeting' | 'note')}
                            className={`h-10 w-10 p-0 ${action.className}`}
                          >
                            {action.icon}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{action.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </TooltipProvider>
                ) : (
                  // Compact view for very small screens
                  <TooltipProvider>
                    {quickActions.map(action => (
                      <Tooltip key={action.id}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleActionClick(action.id as 'task' | 'meeting' | 'note')}
                            className={`h-9 w-9 p-0 ${action.className}`}
                          >
                            {action.icon}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{action.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </TooltipProvider>
                )}
              </div>
            </div>
            
            {/* Expandable Content Area */}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 text-center">
                    <h3 className="text-xl font-bold text-[#F1F5F9] bg-clip-text text-transparent bg-gradient-to-r from-neon-aqua to-neon-purple cursor-pointer">
                      Invite the team!
                    </h3>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <TaskCreateModal 
        open={activeModal === 'task'} 
        onOpenChange={(open) => {
          if (!open) setActiveModal(null);
        }}
        onTaskCreated={() => {
          // You would typically refresh task data here
        }}
      />

      <MeetingCreateModal 
        open={activeModal === 'meeting'} 
        onOpenChange={(open) => {
          if (!open) setActiveModal(null);
        }}
        onSubmit={(meetingData) => createMeeting(meetingData)}
      />
      
      <NotebookCreateModal 
        open={activeModal === 'note'} 
        onOpenChange={(open) => {
          if (!open) setActiveModal(null);
        }}
        onSubmit={(title) => {
          console.log(`Creating notebook: ${title}`);
        }}
      />
    </>
  );
}
