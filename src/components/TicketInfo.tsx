
import { motion } from 'framer-motion';
import { AlertCircle, Clock, MessageCircle, NotebookPen, User, Building, Calendar, Users, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Ticket } from '@/utils/types';
import { formatDistanceToNow } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface TicketInfoProps {
  ticket: Ticket;
  showActionButtons?: boolean;
  onOpenChat?: () => void;
  onOpenScratchpad?: () => void;
}

export function TicketInfo({ 
  ticket, 
  showActionButtons = true,
  onOpenChat, 
  onOpenScratchpad 
}: TicketInfoProps) {
  const [showDetails, setShowDetails] = useState(true);
  const navigate = useNavigate();
  const [parentTask, setParentTask] = useState<{ id: string; title: string } | null>(null);

  // Fetch parent task info if this is a subtask
  useEffect(() => {
    const fetchParentTask = async () => {
      if (ticket.parent_task_id) {
        try {
          const { data, error } = await supabase
            .from('tasks')
            .select('id, title')
            .eq('id', ticket.parent_task_id)
            .single();
          
          if (error) {
            console.error('Error fetching parent task:', error);
            return;
          }
          
          if (data) {
            setParentTask({
              id: data.id,
              title: data.title
            });
          }
        } catch (err) {
          console.error('Error in parent task fetch:', err);
        }
      }
    };
    
    fetchParentTask();
  }, [ticket.parent_task_id]);

  const priorityColors = {
    low: 'bg-gradient-to-r from-blue-600/40 to-sky-600/40 text-white border-blue-400/50',
    medium: 'bg-gradient-to-r from-yellow-600/40 to-amber-600/40 text-white border-yellow-400/50',
    high: 'bg-gradient-to-r from-orange-600/40 to-red-600/40 text-white border-orange-400/50',
    urgent: 'bg-gradient-to-r from-red-600/40 to-rose-600/40 text-white border-red-400/50'
  };

  const statusColors = {
    open: 'bg-gradient-to-r from-purple-600/40 to-violet-600/40 text-white border-purple-400/50',
    'in-progress': 'bg-gradient-to-r from-blue-600/40 to-indigo-600/40 text-white border-blue-400/50',
    resolved: 'bg-gradient-to-r from-green-600/40 to-emerald-600/40 text-white border-green-400/50',
    closed: 'bg-gradient-to-r from-gray-600/40 to-slate-600/40 text-white border-gray-400/50',
    completed: 'bg-gradient-to-r from-green-600/40 to-emerald-600/40 text-white border-green-400/50'
  };

  const handleTaskClick = () => {
    // Navigate to the tasks tab and open this task
    navigate('/', { 
      state: { 
        activeTab: 'tasks', 
        openTaskId: ticket.id 
      } 
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-lg border border-border/50 bg-gradient-to-br from-gray-700/70 to-gray-600/50 backdrop-blur-sm shadow-md overflow-hidden mb-4 cursor-pointer"
      onClick={handleTaskClick}
    >
      <div className="flex flex-col">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex space-x-2">
              <Badge variant="outline" className={statusColors[ticket.status] || statusColors.open}>
                {ticket.status.replace('-', ' ')}
              </Badge>
              <Badge variant="outline" className={priorityColors[ticket.priority] || priorityColors.medium}>
                {ticket.priority}
              </Badge>
              
              {/* Display Mission association if this is a subtask */}
              {ticket.parent_task_id && (
                <Badge variant="outline" className="bg-gradient-to-r from-neon-aqua/40 to-neon-purple/40 text-white border-neon-aqua/50">
                  <Zap className="h-3 w-3 mr-1 text-neon-aqua" />
                  Mission Task
                </Badge>
              )}
            </div>
          </div>
          
          <h2 className="text-lg font-semibold mt-2 text-white">
            {ticket.title}
          </h2>
          
          <div className="flex flex-wrap items-center text-xs text-white/80 space-x-4 mt-3">
            <div className="flex items-center">
              <User className="h-3 w-3 mr-1" />
              <span>{ticket.customer?.name || 'Unassigned'}</span>
            </div>
            {ticket.customer?.company && (
              <div className="flex items-center">
                <Building className="h-3 w-3 mr-1" />
                <span>{ticket.customer.company}</span>
              </div>
            )}
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>Updated {formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}</span>
            </div>
            <div className="flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              <span>#{ticket.id.split('-')[0]}</span>
            </div>
          </div>
        </div>

        <Collapsible open={showDetails} onOpenChange={setShowDetails}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full flex items-center justify-center rounded-none border-t h-6 text-xs text-white/80"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4 pt-2 space-y-4 bg-gradient-to-br from-gray-600/70 to-gray-500/50">
              {/* Display task description */}
              {ticket.description && (
                <div>
                  <h4 className="text-xs font-medium mb-1 text-primary">Description</h4>
                  <p className="text-xs text-white/80">{ticket.description}</p>
                </div>
              )}

              {/* Display summary if available */}
              {ticket.summary && !ticket.description && (
                <div>
                  <h4 className="text-xs font-medium mb-1 text-primary">Summary</h4>
                  <p className="text-xs text-white/80">{ticket.summary}</p>
                </div>
              )}

              {/* Display parent mission info if this is a subtask */}
              {parentTask && (
                <div>
                  <h4 className="text-xs font-medium mb-1 text-neon-aqua">Parent Mission</h4>
                  <p className="text-xs flex items-center text-white/80">
                    <Zap className="h-3 w-3 mr-1 text-neon-aqua" />
                    <span>{parentTask.title}</span>
                  </p>
                </div>
              )}

              {ticket.actionItems && ticket.actionItems.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium mb-1 text-primary">Action Items</h4>
                  <ul className="space-y-1">
                    {ticket.actionItems.map((item, index) => (
                      <li key={index} className="text-xs text-white/80 flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent mr-2 mt-1.5"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {showActionButtons && onOpenChat && onOpenScratchpad && (
                <div className="flex justify-between items-center pt-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full h-10 w-10 p-0 flex items-center justify-center 
                                bg-gradient-to-br from-primary to-primary/70 text-black border-0
                                hover:from-primary/90 hover:to-primary/60 shadow-md hover:shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenChat();
                      }}
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span className="sr-only">Open Chat</span>
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full h-10 w-10 p-0 flex items-center justify-center 
                                bg-gradient-to-br from-accent to-accent/70 text-black border-0
                                hover:from-accent/90 hover:to-accent/60 shadow-md hover:shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenScratchpad();
                      }}
                    >
                      <NotebookPen className="h-5 w-5" />
                      <span className="sr-only">Open Scratchpad</span>
                    </Button>
                  </motion.div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </motion.div>
  );
}
