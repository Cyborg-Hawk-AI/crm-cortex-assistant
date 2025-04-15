
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Code, FileText, ShieldAlert, MessageCircleReply, 
  Search, HelpCircle, LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatMessages } from '@/hooks/useChatMessages';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { useToast } from '@/hooks/use-toast';
import { NotionTaskSearch } from './NotionTaskSearch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ASSISTANTS } from '@/utils/assistantConfig';

interface QuickActionsProps {
  activeConversationId: string | null;
}

export function QuickActions({ activeConversationId }: QuickActionsProps) {
  const [isLinkingTask, setIsLinkingTask] = React.useState(false);
  const { 
    inputValue, 
    setInputValue, 
    setActiveAssistant, 
    linkTaskToConversation,
    linkedTask, 
    sendMessage,
    isStreaming,
    messages
  } = useChatMessages();
  const { toast } = useToast();

  React.useEffect(() => {
    console.log(`QuickActions: Active conversation ID is ${activeConversationId || 'null'} (from props)`);
  }, [activeConversationId]);

  const actions = [
    {
      id: 'code-review',
      icon: <Code className="h-4 w-4" />,
      label: 'Code Review',
      color: 'bg-primary text-primary-foreground',
      assistantId: ASSISTANTS.CODE_REVIEW.id,
      assistantName: ASSISTANTS.CODE_REVIEW.name,
      prompt: 'Please review all code discussed in this conversation and provide a comprehensive code review.'
    },
    {
      id: 'documentation',
      icon: <FileText className="h-4 w-4" />,
      label: 'Documentation',
      color: 'bg-accent text-accent-foreground',
      assistantId: ASSISTANTS.DOCUMENTATION.id,
      assistantName: ASSISTANTS.DOCUMENTATION.name,
      prompt: 'Based on the entire conversation history, please generate comprehensive technical documentation.'
    },
    {
      id: 'risk-assessment',
      icon: <ShieldAlert className="h-4 w-4" />,
      label: 'Risk Assessment',
      color: 'bg-primary text-primary-foreground',
      assistantId: ASSISTANTS.RISK_ASSESSMENT.id,
      assistantName: ASSISTANTS.RISK_ASSESSMENT.name,
      prompt: 'Please analyze all discussed topics in this conversation and provide a thorough risk assessment.'
    },
    {
      id: 'summarize',
      icon: <MessageCircleReply className="h-4 w-4" />,
      label: 'Summarize',
      color: 'bg-secondary text-secondary-foreground',
      assistantId: ASSISTANTS.SUMMARIZER.id,
      assistantName: ASSISTANTS.SUMMARIZER.name,
      prompt: 'Please provide a detailed summary of the entire conversation history.'
    },
    {
      id: 'search',
      icon: <Search className="h-4 w-4" />,
      label: 'Search',
      color: 'bg-secondary text-secondary-foreground',
      assistantId: ASSISTANTS.SEARCH.id,
      assistantName: ASSISTANTS.SEARCH.name,
      prompt: 'Based on the conversation history, what would you like me to search for?'
    },
    {
      id: 'help',
      icon: <HelpCircle className="h-4 w-4" />,
      label: 'Help',
      color: 'bg-muted text-muted-foreground',
      assistantId: ASSISTANTS.HELP.id,
      assistantName: ASSISTANTS.HELP.name,
      prompt: 'How can I help you with the topics discussed in this conversation?'
    },
    {
      id: 'link-task',
      icon: <LinkIcon className="h-4 w-4" />,
      label: 'Link Task',
      color: 'bg-cool-mist text-forest-green',
      action: () => setIsLinkingTask(true)
    }
  ];

  const handleAction = async (assistantId: string, assistantName: string, icon: React.ReactNode, label: string, prompt: string) => {
    if (isStreaming) {
      toast({
        title: "Please wait",
        description: "Please wait for the current response to finish before sending a new message"
      });
      return;
    }
    
    if (!activeConversationId) {
      console.error("No active conversation ID found when attempting to use quick action");
      toast({
        title: "No active conversation",
        description: "Please select a conversation first"
      });
      return;
    }

    try {
      await setActiveAssistant({
        id: assistantId,
        name: assistantName,
        description: `Specialized in ${label.toLowerCase()} tasks`,
        icon: icon as string,
        capabilities: [],
      });
      
      // Use the predefined prompt for the action instead of user input
      await sendMessage(prompt, 'user', activeConversationId);
      
      toast({
        title: "Assistant activated",
        description: `Using the ${assistantName} assistant`
      });
    } catch (error) {
      console.error("Error in quick action:", error);
      toast({
        title: "Error",
        description: "Failed to activate assistant. Please try again."
      });
    }
  };

  const handleTaskSelect = (taskId: string) => {
    // Mock tasks for this example
    const tasks = [];
    
    const selectedTask = tasks.find(task => task.id === taskId);
    
    if (selectedTask) {
      linkTaskToConversation(selectedTask);
      setIsLinkingTask(false);
      
      if (activeConversationId) {
        toast({
          title: "Task linked",
          description: `Task "${selectedTask.title}" is now linked to this conversation`
        });
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="mb-4"
    >
      {linkedTask && (
        <div className="mb-3 p-2 bg-secondary/50 rounded border border-primary/20 text-xs text-primary">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">Linked Task:</span> {linkedTask.title}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-7 gap-2">
        {actions.map((action) => (
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
                      handleAction(
                        action.assistantId, 
                        action.assistantName, 
                        action.icon, 
                        action.label,
                        action.prompt
                      );
                    }
                  }}
                  className={`w-10 h-10 p-0 rounded-full flex items-center justify-center ${action.color}`}
                  disabled={isStreaming}
                >
                  {action.icon}
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="p-2 text-center">
                <span className="text-xs text-foreground">{action.label}</span>
              </HoverCardContent>
            </HoverCard>
          </motion.div>
        ))}
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
