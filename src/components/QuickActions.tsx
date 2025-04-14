
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Code, FileText, ShieldAlert, MessageCircleReply, 
  Search, HelpCircle, Menu, LinkIcon, X,
  ArrowRight, MoreHorizontal, Loader2
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
    isStreaming,
    isSending,
    activeConversationId
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

  // Log the active conversation ID when it changes
  useEffect(() => {
    console.log('📍 QuickActions: Current active conversation ID:', activeConversationId);
  }, [activeConversationId]);

  const actions = [
    {
      id: 'code-review',
      icon: <Code className="h-4 w-4" />,
      label: 'Code Review',
      color: 'bg-primary text-primary-foreground',
      assistantId: ASSISTANTS.CODE_REVIEW.id,
      assistantName: ASSISTANTS.CODE_REVIEW.name,
      systemPrompt: ASSISTANTS.CODE_REVIEW.prompt
    },
    {
      id: 'documentation',
      icon: <FileText className="h-4 w-4" />,
      label: 'Documentation',
      color: 'bg-accent text-accent-foreground',
      assistantId: ASSISTANTS.DOCUMENTATION.id,
      assistantName: ASSISTANTS.DOCUMENTATION.name,
      systemPrompt: ASSISTANTS.DOCUMENTATION.prompt
    },
    {
      id: 'risk-assessment',
      icon: <ShieldAlert className="h-4 w-4" />,
      label: 'Risk Assessment',
      color: 'bg-primary text-primary-foreground',
      assistantId: ASSISTANTS.RISK_ASSESSMENT.id,
      assistantName: ASSISTANTS.RISK_ASSESSMENT.name,
      systemPrompt: ASSISTANTS.RISK_ASSESSMENT.prompt
    },
    {
      id: 'summarize',
      icon: <MessageCircleReply className="h-4 w-4" />,
      label: 'Summarize',
      color: 'bg-secondary text-secondary-foreground',
      assistantId: ASSISTANTS.SUMMARIZER.id,
      assistantName: ASSISTANTS.SUMMARIZER.name,
      systemPrompt: ASSISTANTS.SUMMARIZER.prompt
    },
    {
      id: 'search',
      icon: <Search className="h-4 w-4" />,
      label: 'Search',
      color: 'bg-secondary text-secondary-foreground',
      assistantId: ASSISTANTS.SEARCH.id,
      assistantName: ASSISTANTS.SEARCH.name,
      systemPrompt: ASSISTANTS.SEARCH.prompt
    },
    {
      id: 'help',
      icon: <HelpCircle className="h-4 w-4" />,
      label: 'Help',
      color: 'bg-muted text-muted-foreground',
      assistantId: ASSISTANTS.HELP.id,
      assistantName: ASSISTANTS.HELP.name,
      systemPrompt: ASSISTANTS.HELP.prompt
    },
    {
      id: 'link-task',
      icon: <LinkIcon className="h-4 w-4" />,
      label: 'Link Task',
      color: 'bg-cool-mist text-forest-green',
      action: () => setIsLinkingTask(true)
    }
  ];

  const handleAction = async (assistantId: string, assistantName: string, icon: React.ReactNode, label: string, systemPrompt?: string) => {
    if (isStreaming || isSending) {
      toast({
        title: "Please wait",
        description: "Please wait for the current response to finish before sending a new message"
      });
      return;
    }
    
    // Verify we have an active conversation
    if (!activeConversationId) {
      toast({
        title: "No active conversation",
        description: "Please start a conversation first using the message input below"
      });
      return;
    }
    
    try {
      console.log('📍 QuickActions: handleAction triggered', {
        assistantId,
        assistantName,
        label,
        activeConversationId,
        inputValue
      });
      
      // Set the assistant with all required properties
      const assistantIcon = typeof icon === 'string' ? icon : label.charAt(0);
      
      await setActiveAssistant({
        id: assistantId,
        name: assistantName,
        description: systemPrompt || `Specialized in ${label.toLowerCase()} tasks`,
        icon: assistantIcon,
        capabilities: [], 
      });
      
      console.log('📍 QuickActions: Assistant set successfully', { assistantId, assistantName });
      
      // Prepare message content - use input if available or generic message
      const messageToSend = inputValue.trim() || `Help me with ${label.toLowerCase()}`;
      console.log('📍 QuickActions: Message to send', { messageToSend });
      
      // Always use the existing conversation
      console.log(`📍 QuickActions: Using existing conversation: ${activeConversationId}`);
      
      // Clear the input before sending to avoid double sends
      setInputValue('');
      
      // Send message within the existing conversation (explicitly don't pass specificConversationId)
      await sendMessage(messageToSend, 'user');
      
      // Collapse the quick actions after use
      setExpanded(false);
      
      toast({
        title: "Assistant activated",
        description: `Using the ${assistantName} assistant`
      });
    } catch (error) {
      console.error('📍 QuickActions: Error in quick action:', error);
      toast({
        title: "Action failed",
        description: "There was a problem processing your request",
        variant: "destructive"
      });
    }
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

  // Determine display mode based on screen width
  const displayMode = () => {
    if (windowWidth < 480) return 'compact'; // Ultra compact for very small screens
    if (windowWidth < 640) return 'small';   // Smaller grid for small screens
    return 'full';                           // Full grid for larger screens
  };

  // Mock tasks for this example - in real app this would come from a hook
  const tasks = [];

  const getGridCols = () => {
    switch(displayMode()) {
      case 'compact': return 'grid-cols-2';
      case 'small': return 'grid-cols-3';
      default: return 'grid-cols-3 md:grid-cols-4';
    }
  };

  const getVisibleActions = () => {
    if (expanded) return actions;
    
    switch(displayMode()) {
      case 'compact': return actions.slice(0, 2);  // Show only 2 for very small screens
      case 'small': return actions.slice(0, 3);    // Show 3 for small screens
      default: return actions.slice(0, 3);         // Show 3 for larger screens by default
    }
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
        {displayMode() === 'compact' ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs h-6 w-6 p-0 text-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              {actions.slice(getVisibleActions().length).map(action => (
                <DropdownMenuItem 
                  key={action.id}
                  onClick={() => {
                    if (action.action) {
                      action.action();
                    } else if (action.assistantId && action.assistantName) {
                      handleAction(action.assistantId, action.assistantName, action.icon, action.label, action.systemPrompt);
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <span className={`p-1 rounded-full ${action.color}`}>{action.icon}</span>
                  <span>{action.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-xs h-6 px-2 text-foreground"
          >
            {expanded ? 'Collapse' : 'View all'}
            <ArrowRight className={`h-3 w-3 ml-1 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
          </Button>
        )}
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

      <div className={`grid ${getGridCols()} gap-2`}>
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
                      handleAction(action.assistantId, action.assistantName, action.icon, action.label, action.systemPrompt);
                    }
                  }}
                  className={`w-10 h-10 p-0 rounded-full flex items-center justify-center ${action.color}`}
                  disabled={isStreaming || isSending || !activeConversationId}
                >
                  {(isStreaming || isSending) ? <Loader2 className="h-4 w-4 animate-spin" /> : action.icon}
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="p-2 text-center">
                <span className="text-xs text-foreground">{action.label}</span>
              </HoverCardContent>
            </HoverCard>
          </motion.div>
        ))}

        {!expanded && displayMode() !== 'compact' && actions.length > getVisibleActions().length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            whileHover={{ y: -2 }}
            className="flex"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpanded(true)}
              className="w-10 h-10 p-0 rounded-full flex items-center justify-center bg-muted/80 text-foreground"
              disabled={isStreaming || isSending}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
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
