
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronUp, 
  ChevronDown, 
  Plus, 
  CalendarPlus, 
  ListTodo, 
  UserPlus,
  BookOpen
} from 'lucide-react';
import { Button } from './ui/button';
import { TaskCreateModal } from './modals/TaskCreateModal';
import { MeetingCreateModal } from './modals/MeetingCreateModal';
import { ContactCreateModal } from './modals/ContactCreateModal';
import { NotebookCreateModal } from './modals/NotebookCreateModal';
import { useMeetings } from '@/hooks/useMeetings';

export function FloatingActionBar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeModal, setActiveModal] = useState<'task' | 'meeting' | 'contact' | 'note' | null>(null);
  const { createMeeting } = useMeetings();

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

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveModal('task')}
                      className="h-8 bg-gradient-to-r from-neon-aqua/20 to-neon-green/20 text-[#F1F5F9] border-neon-aqua/30
                                hover:bg-gradient-to-r hover:from-neon-aqua/30 hover:to-neon-green/30 hover:shadow-[0_0_8px_rgba(0,247,239,0.4)]"
                    >
                      <ListTodo className="h-4 w-4 mr-1 text-neon-aqua" /> New Mission
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveModal('meeting')}
                      className="h-8 bg-gradient-to-r from-neon-blue/20 to-neon-blue/10 text-[#F1F5F9] border-neon-blue/30
                                hover:bg-gradient-to-r hover:from-neon-blue/30 hover:to-neon-blue/20 hover:shadow-[0_0_8px_rgba(14,165,233,0.4)]"
                    >
                      <CalendarPlus className="h-4 w-4 mr-1 text-neon-blue" /> New SyncUp
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveModal('note')}
                      className="h-8 bg-gradient-to-r from-neon-purple/20 to-neon-purple/10 text-[#F1F5F9] border-neon-purple/30
                                hover:bg-gradient-to-r hover:from-neon-purple/30 hover:to-neon-purple/20 hover:shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                    >
                      <BookOpen className="h-4 w-4 mr-1 text-neon-purple" /> New Note
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveModal('contact')}
                      className="h-8 bg-gradient-to-r from-neon-yellow/20 to-neon-yellow/10 text-[#F1F5F9] border-neon-yellow/30
                                hover:bg-gradient-to-r hover:from-neon-yellow/30 hover:to-neon-yellow/20 hover:shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                    >
                      <UserPlus className="h-4 w-4 mr-1 text-neon-yellow" /> Add to Orbit
                    </Button>
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
                </div>
                
                {/* Empty content area - removed ticket actions */}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 text-center text-[#CBD5E1] text-sm">
                        Select an action from above to get started
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

      <ContactCreateModal 
        open={activeModal === 'contact'} 
        onOpenChange={(open) => {
          if (!open) setActiveModal(null);
        }}
        onContactCreated={() => {
          // You would typically refresh contact data here
        }}
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
