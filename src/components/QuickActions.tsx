import React from 'react';
import { motion } from 'framer-motion';
import { 
  Code, FileText, ShieldAlert, MessageCircleReply, 
  Search, HelpCircle, LinkIcon, Folder, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatMessages } from '@/hooks/useChatMessages';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { useToast } from '@/hooks/use-toast';
import { NotionTaskSearch } from './NotionTaskSearch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ASSISTANTS } from '@/utils/assistantConfig';
import { useProjects } from '@/hooks/useProjects';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/supabase';
import { Task, TaskStatus, TaskPriority } from '@/utils/types';

interface QuickActionsProps {
  activeConversationId: string | null;
}

export function QuickActions({ activeConversationId }: QuickActionsProps) {
  const [isLinkingTask, setIsLinkingTask] = React.useState(false);
  const [isLinkingMission, setIsLinkingMission] = React.useState(false);
  
  const { 
    inputValue, 
    setInputValue, 
    setActiveAssistant, 
    linkTaskToConversation,
    linkedTask,
    linkedProject,
    sendMessage,
    isStreaming,
    messages,
    linkMissionToConversation
  } = useChatMessages();
  const { toast } = useToast();

  const { data: missions = [], isLoading: loadingMissions } = useQuery({
    queryKey: ['missions'],
    queryFn: async () => {
      const userId = await getCurrentUserId();
      if (!userId) return [];
      
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('id, title')
          .is('parent_task_id', null)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching missions:', error);
          return [];
        }
        
        return (data || []).map(mission => ({
          id: mission.id,
          name: mission.title || 'Untitled Mission'
        }));
      } catch (err) {
        console.error('Error in mission fetch:', err);
        return [];
      }
    }
  });

  const [selectedMissionId, setSelectedMissionId] = React.useState<string | null>(null);
  const [missionTasks, setMissionTasks] = React.useState<any[]>([]);
  
  React.useEffect(() => {
    const fetchMissionTasks = async () => {
      if (!selectedMissionId) return;
      
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('id, title')
          .eq('parent_task_id', selectedMissionId)
          .order('created_at', { ascending: true });
          
        if (error) {
          console.error('Error fetching mission tasks:', error);
          return;
        }
        
        setMissionTasks(data || []);
      } catch (err) {
        console.error('Error fetching mission tasks:', err);
      }
    };
    
    fetchMissionTasks();
  }, [selectedMissionId]);

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
      id: 'link-mission',
      icon: <Zap className="h-4 w-4" />,
      label: 'Link Mission',
      color: 'bg-cool-mist text-forest-green',
      action: () => setIsLinkingMission(true)
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

  const handleMissionSelect = async (missionId: string, isTask: boolean = false) => {
    if (!activeConversationId) {
      toast({
        title: "No active conversation",
        description: "Please select a conversation first"
      });
      return;
    }

    try {
      if (!isTask) {
        setSelectedMissionId(missionId);
        return;
      }
      
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('id, title, description')
        .eq('id', missionId)
        .single();
      
      if (taskError || !taskData) {
        throw new Error(taskError?.message || 'Failed to fetch task data');
      }
      
      const missionDetails: Task = {
        id: taskData.id,
        title: taskData.title,
        description: taskData.description || null,
        status: 'open' as TaskStatus,
        priority: 'medium' as TaskPriority,
        due_date: null,
        assignee_id: null,
        reporter_id: '',
        user_id: '',
        parent_task_id: null,
        created_at: new Date(),
        updated_at: new Date(),
        tags: []
      };
      
      await linkMissionToConversation(missionDetails);
      setIsLinkingMission(false);
      setSelectedMissionId(null);
      
      toast({
        title: "Mission linked",
        description: `"${taskData.title}" is now linked to this conversation`
      });
    } catch (error: any) {
      console.error('Error linking mission:', error);
      toast({
        title: "Error",
        description: "Failed to link mission to conversation"
      });
    }
  };

  const handleCloseMissionDialog = () => {
    setIsLinkingMission(false);
    setSelectedMissionId(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="mb-4"
    >
      {linkedProject && (
        <div className="mb-3 p-2 bg-secondary/50 rounded border border-primary/20 text-xs text-primary">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Folder className="h-3 w-3" />
              <span className="font-medium">Project:</span> {linkedProject?.name || 'Open Chats'}
            </div>
          </div>
        </div>
      )}

      {linkedTask && (
        <div className="mb-3 p-2 bg-secondary/50 rounded border border-primary/20 text-xs text-primary">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-3 w-3" />
              <span className="font-medium">Linked Mission:</span> {linkedTask.title}
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

      <Dialog open={isLinkingMission} onOpenChange={handleCloseMissionDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {!selectedMissionId ? "Link Mission to Conversation" : "Select Task from Mission"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {!selectedMissionId ? (
              <div className="space-y-2">
                {missions && missions.length > 0 ? (
                  missions.map((mission) => (
                    <Button 
                      key={mission.id} 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => handleMissionSelect(mission.id)}
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      <span className="flex-1 text-left">{mission.name}</span>
                    </Button>
                  ))
                ) : (
                  <div className="text-center p-4">
                    <p className="text-sm text-muted-foreground">No missions found</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start bg-primary/10"
                  onClick={() => handleMissionSelect(selectedMissionId, true)}
                >
                  <Folder className="mr-2 h-4 w-4" />
                  <span className="flex-1 text-left">
                    {missions.find(m => m.id === selectedMissionId)?.name || 'This Mission (Parent)'}
                  </span>
                </Button>
                
                <div className="py-1 px-2 bg-secondary/30 text-xs rounded-sm mb-2">Tasks in this mission:</div>
                
                {missionTasks && missionTasks.length > 0 ? (
                  missionTasks.map((task) => (
                    <Button 
                      key={task.id} 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => handleMissionSelect(task.id, true)}
                    >
                      <LinkIcon className="mr-2 h-3.5 w-3.5" />
                      <span className="flex-1 text-left">{task.title}</span>
                    </Button>
                  ))
                ) : (
                  <div className="text-center p-4">
                    <p className="text-sm text-muted-foreground">No tasks found in this mission</p>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => setSelectedMissionId(null)}
                >
                  Back to Missions List
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
