
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeModal, setActiveModal] = useState<'task' | 'meeting' | 'contact' | 'note' | null>(null);
  const { createMeeting } = useMeetings();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = useIsMobile();
  
  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    // Track window resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [lastScrollY]);

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
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 z-50"
          >
            <div className="max-w-6xl mx-auto px-4">
              <div className="bg-[#25384D] border border-[#3A4D62] rounded-t-lg shadow-[0_-4px_20px_rgba(0,247,239,0.15)]">
                <div className="flex justify-between items-center p-2 border-b border-[#3A4D62]">
                  <h3 className="text-sm font-medium text-[#F1F5F9] ml-2">Quick Actions</h3>
                  
                  {displayMode() === 'compact' ? (
                    // Compact view for very small screens - dropdown menu
                    <div className="flex items-center space-x-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8">
                            <Plus className="h-4 w-4 mr-1" /> Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9]">
                          {quickActions.map(action => (
                            <DropdownMenuItem 
                              key={action.id}
                              onClick={() => handleActionClick(action.id as 'task' | 'meeting' | 'note')}
                              className="flex items-center cursor-pointer"
                            >
                              {action.icon}
                              <span className="ml-2">{action.label}</span>
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuItem 
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="flex items-center cursor-pointer"
                          >
                            {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            <span className="ml-2">{isCollapsed ? 'Expand' : 'Collapse'}</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ) : displayMode() === 'iconOnly' ? (
                    // Icon-only view for small screens
                    <div className="flex items-center space-x-2">
                      <TooltipProvider>
                        {quickActions.map(action => (
                          <Tooltip key={action.id}>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleActionClick(action.id as 'task' | 'meeting' | 'note')}
                                className={`h-8 w-8 p-0 ${action.className}`}
                              >
                                {action.icon}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{action.label}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setIsCollapsed(!isCollapsed)}
                              className="h-8 w-8 text-[#F1F5F9] hover:text-neon-aqua"
                            >
                              {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{isCollapsed ? 'Expand' : 'Collapse'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ) : (
                    // Full view for larger screens
                    <div className="flex items-center space-x-2">
                      {quickActions.map(action => (
                        <Button
                          key={action.id}
                          variant="outline"
                          size="sm"
                          onClick={() => handleActionClick(action.id as 'task' | 'meeting' | 'note')}
                          className={`h-8 transition-all duration-300 ${action.className}`}
                        >
                          {action.icon} <span className="ml-1">{action.label}</span>
                        </Button>
                      ))}
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
                  )}
                </div>
                
                {/* Empty content area */}
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
        )}
      </AnimatePresence>

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
