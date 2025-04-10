import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Code, FileText, ShieldAlert, MessageCircleReply, 
  Search, HelpCircle, Menu, LinkIcon, X,
  ArrowRight, MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatMessages } from '@/hooks/useChatMessages';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { useToast } from '@/hooks/use-toast';
import { NotionTaskSearch } from './NotionTaskSearch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ASSISTANTS } from '@/utils/assistantConfig';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export function QuickActions() {
  const [expanded, setExpanded] = useState(false);
  const [isLinkingTask, setIsLinkingTask] = useState(false);
  const { 
    addMessage, 
    inputValue, 
    setInputValue, 
    setActiveAssistant, 
    linkTaskToConversation,
    linkedTask, 
    sendMessage,
    isStreaming
  } = useChatMessages();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Update windowWidth state when window is resized
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const actions = [
    {
      id: 'code-review',
      icon: <Code className="h-4 w-4" />,
      label: 'Code Review',
      color: 'bg-primary text-primary-foreground',
      assistantId: ASSISTANTS.CODE_REVIEW.id,
      assistantName: ASSISTANTS.CODE_REVIEW.name,
    },
    {
      id: 'documentation',
      icon: <FileText className="h-4 w-4" />,
      label: 'Documentation',
      color: 'bg-accent text-accent-foreground',
      assistantId: ASSISTANTS.DOCUMENTATION.id,
      assistantName: ASSISTANTS.DOCUMENTATION.name,
    },
    {
      id: 'risk-assessment',
      icon: <ShieldAlert className="h-4 w-4" />,
      label: 'Risk Assessment',
      color: 'bg-primary text-primary-foreground',
      assistantId: ASSISTANTS.RISK_ASSESSMENT.id,
      assistantName: ASSISTANTS.RISK_ASSESSMENT.name,
    },
    {
      id: 'summarize',
      icon: <MessageCircleReply className="h-4 w-4" />,
      label: 'Summarize',
      color: 'bg-secondary text-secondary-foreground',
      assistantId: ASSISTANTS.SUMMARIZER.id,
      assistantName: ASSISTANTS.SUMMARIZER.name,
    },
    {
      id: 'search',
      icon: <Search className="h-4 w-4" />,
      label: 'Search',
      color: 'bg-secondary text-secondary-foreground',
      assistantId: ASSISTANTS.SEARCH.id,
      assistantName: ASSISTANTS.SEARCH.name,
    },
    {
      id: 'help',
      icon: <HelpCircle className="h-4 w-4" />,
      label: 'Help',
      color: 'bg-muted text-muted-foreground',
      assistantId: ASSISTANTS.HELP.id,
      assistantName: ASSISTANTS.HELP.name,
    },
    {
      id: 'link-task',
      icon: <LinkIcon className="h-4 w-4" />,
      label: 'Link Task',
      color: 'bg-cool-mist text-forest-green',
      action: () => setIsLinkingTask(true)
    }
  ];

  const handleAction = async (assistantId: string, assistantName: string, icon: React.ReactNode, label: string) => {
    if (isStreaming) {
      toast({
        title: "Please wait",
        description: "Please wait for the current response to finish before sending a new message"
      });
      return;
    }
    
    const messageToSend = inputValue.trim() || `Help me with ${label.toLowerCase()}`;
    
    // Set the assistant with all required properties
    await setActiveAssistant({
      id: assistantId,
      name: assistantName,
      description: `Specialized in ${label.toLowerCase()} tasks`,
      icon: icon as string,
      capabilities: [], // Adding capabilities to match type
    });
    
    // Clear the input and send the message
    setInputValue('');
    sendMessage(messageToSend, 'user');
    
    setExpanded(false);
    
    toast({
      title: "Assistant activated",
      description: `Using the ${assistantName} assistant`
    });
  };

  const handleTaskSelect = (taskId: string) => {
    const selectedTask = tasks.find(task => task.id === taskId);
    
    if (selectedTask) {
      linkTaskToConversation(selectedTask);
      setIsLinkingTask(false);
      
      addMessage(`TICKETCONTENTS-${JSON.stringify(selectedTask)}`, 'system');
      
      toast({
        title: "Task linked",
        description: `Task "${selectedTask.title}" is now linked to this conversation`
      });
    }
  };

  // Mock tasks for this example - in real app this would come from a hook
  const tasks = [];

  // Always show at least 3 buttons no matter how small the screen is
  const getVisibleActions = () => {
    if (expanded) return actions;
    
    // Even at the smallest screens, always show at least 3 action buttons
    return actions.slice(0, 3);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="mb-4"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-foreground">Quick Actions</h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="text-xs h-6 px-2 text-foreground"
        >
          {expanded ? 'Collapse' : 'View all'}
          <ArrowRight className={`h-3 w-3 ml-1 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
        </Button>
      </div>

      {linkedTask && (
        <div className="mb-3 p-2 bg-secondary/50 rounded border border-primary/20 text-xs text-primary">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">Linked Task:</span> {linkedTask.title}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-5 w-5 p-0" 
              onClick={() => linkTaskToConversation(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {getVisibleActions().map((action) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            whileHover={{ y: -2 }}
            className="flex"
          >
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (action.action) {
                      action.action();
                    } else if (action.assistantId && action.assistantName) {
                      handleAction(action.assistantId, action.assistantName, action.icon, action.label);
                    }
                  }}
                  className={`w-full h-10 flex items-center justify-center ${action.color}`}
                  disabled={isStreaming}
                >
                  <div className="flex flex-col items-center">
                    {action.icon}
                    <span className="text-[10px] mt-1 hidden sm:inline">{action.label}</span>
                  </div>
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="p-2 text-center">
                <span className="text-xs text-foreground">{action.label}</span>
              </HoverCardContent>
            </HoverCard>
          </motion.div>
        ))}

        {!expanded && actions.length > getVisibleActions().length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            whileHover={{ y: -2 }}
            className="flex"
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-10 flex items-center justify-center bg-muted/80 text-foreground"
                >
                  <div className="flex flex-col items-center">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="text-[10px] mt-1 hidden sm:inline">More</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions.slice(getVisibleActions().length).map(action => (
                  <DropdownMenuItem
                    key={action.id}
                    onClick={() => {
                      if (action.action) {
                        action.action();
                      } else if (action.assistantId && action.assistantName) {
                        handleAction(action.assistantId, action.assistantName, action.icon, action.label);
                      }
                    }}
                  >
                    <span className={`mr-2 p-1 rounded-full ${action.color}`}>{action.icon}</span>
                    <span>{action.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        )}
      </div>

      <Dialog open={isLinkingTask} onOpenChange={setIsLinkingTask}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Link Mission to Conversation</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <NotionTaskSearch onSelectTask={handleTaskSelect} />
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
