
import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { PlusCircle, MoreHorizontal, ArrowUpCircle, CircleDot, CheckCircle2, X, Calendar, ChevronRight, ChevronDown, Clock } from 'lucide-react';
import { Task } from '@/utils/types';
import { useMissionTasks } from '@/hooks/useMissionTasks';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface MissionTableViewProps {
  missionId: string;
  onTaskClick?: (taskId: string) => void;
}

export function MissionTableView({ missionId, onTaskClick }: MissionTableViewProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  
  const {
    tasks = [],
    subtasks = {},
    isLoading,
    error,
    currentUserId,
    newTaskTitle: hookTaskTitle,
    setNewTaskTitle: setHookTaskTitle,
    createTask,
    deleteTask,
    updateTaskStatus,
    getSubtasks
  } = useMissionTasks(missionId);

  const { data: userProfiles = {}, isLoading: loadingProfiles } = useQuery({
    queryKey: ['user-profiles-for-mission', missionId],
    queryFn: async () => {
      try {
        const userIds = new Set<string>();
        
        if (!tasks || tasks.length === 0) return {};
        
        tasks.forEach(task => {
          if (task.assignee_id) userIds.add(task.assignee_id);
          if (task.reporter_id) userIds.add(task.reporter_id);
          if (task.user_id) userIds.add(task.user_id);
        });
        
        if (userIds.size === 0) return {};
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', Array.from(userIds));
          
        if (error) {
          console.error('Error fetching user profiles:', error);
          return {};
        }
        
        const profileMap: Record<string, any> = {};
        data?.forEach(profile => {
          profileMap[profile.id] = profile;
        });
        
        return profileMap;
      } catch (err) {
        console.error('Failed to fetch user profiles:', err);
        return {};
      }
    },
    enabled: Array.isArray(tasks) && tasks.length > 0
  });

  const getUserDisplayName = (userId: string | null | undefined) => {
    if (!userId) return 'Unassigned';
    
    const profile = userProfiles[userId];
    if (!profile) return userId.substring(0, 8) + '...';
    
    return profile.full_name || profile.email || userId.substring(0, 8) + '...';
  };

  useEffect(() => {
    if (setHookTaskTitle) {
      setHookTaskTitle(newTaskTitle);
    }
  }, [newTaskTitle, setHookTaskTitle]);
  
  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) {
      toast({
        title: 'Task title required',
        description: 'Please enter a title for the new task',
        variant: 'destructive'
      });
      return;
    }
    
    if (createTask) {
      createTask(newTaskTitle, null);
      setNewTaskTitle('');
    }
  };
  
  const toggleTaskExpanded = (taskId: string) => {
    setExpandedTasks(prev => {
      const newState = { ...prev };
      newState[taskId] = !prev[taskId];
      
      if (!prev[taskId] && getSubtasks) {
        getSubtasks(taskId);
      }
      
      return newState;
    });
  };
  
  const handleStatusChange = (taskId: string, status: string) => {
    if (updateTaskStatus) {
      updateTaskStatus(taskId, status);
    }
  };
  
  const handleDeleteSubtask = (subtaskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteTask) {
      deleteTask(subtaskId);
      toast({
        title: "Subtask deleted",
        description: "The subtask has been removed"
      });
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': 
        return <CircleDot className="h-4 w-4 text-purple-500" />;
      case 'in-progress':
        return <ArrowUpCircle className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return <CircleDot className="h-4 w-4 text-gray-500" />;
    }
  };
  
  if (isLoading) {
    return <div className="p-4 text-center">Loading mission tasks...</div>;
  }
  
  if (error) {
    return <div className="p-4 text-center text-red-500">Error loading tasks</div>;
  }

  if (!tasks || !Array.isArray(tasks)) {
    return <div className="p-4 text-center text-yellow-500">No tasks available. Try refreshing the page.</div>;
  }

  return (
    <div>
      <div className="mb-4 flex">
        <Input 
          placeholder="Add a new task..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className="flex-1 bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9]"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleCreateTask();
            }
          }}
        />
        <Button 
          variant="outline" 
          className="ml-2 border-neon-purple/40 hover:border-neon-purple/70 hover:bg-neon-purple/10"
          onClick={handleCreateTask}
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
      
      <ScrollArea className="h-[calc(100vh-300px)]">
        <Table className="border-[#3A4D62]">
          <TableHeader className="bg-[#1C2A3A]">
            <TableRow>
              <TableHead className="w-[30px]"></TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[100px]">Priority</TableHead>
              <TableHead className="w-[150px]">Due Date</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-[#CBD5E1]">
                  No tasks found. Create your first task to get started.
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <React.Fragment key={task.id}>
                  <TableRow 
                    className="cursor-pointer hover:bg-[#1C2A3A]/40"
                    onClick={() => onTaskClick && onTaskClick(task.id)}
                  >
                    <TableCell className="p-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-5 w-5"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTaskExpanded(task.id);
                        }}
                      >
                        {expandedTasks[task.id] ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{task.title || 'Untitled Task'}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(task.status || 'open')}
                        <span className="capitalize">{(task.status || 'open').replace('-', ' ')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`
                          ${task.priority === 'high' ? 'border-red-400/50 bg-red-500/20 text-red-200' : 
                            task.priority === 'medium' ? 'border-yellow-400/50 bg-yellow-500/20 text-yellow-200' : 
                            'border-blue-400/50 bg-blue-500/20 text-blue-200'}
                        `}
                      >
                        {task.priority || 'low'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {task.due_date ? (
                        <div className="flex items-center text-sm">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(task.due_date), 'MMM d, yyyy')}
                        </div>
                      ) : (
                        <span className="text-[#64748B] text-sm">No due date</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  
                  {expandedTasks[task.id] && (
                    <>
                      <TableRow>
                        <TableCell colSpan={6} className="p-0 border-b-0">
                          <div className="pl-10 pr-4 pb-2 pt-0">
                            <div className="bg-[#1C2A3A]/30 rounded-md p-2">
                              <div className="flex mb-2">
                                <Input 
                                  placeholder="Add subtask..."
                                  className="text-sm h-8 bg-[#1C2A3A] border-[#3A4D62]"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.currentTarget.value && createTask) {
                                      createTask(e.currentTarget.value, task.id);
                                      e.currentTarget.value = '';
                                    }
                                  }}
                                />
                              </div>
                              
                              {subtasks && subtasks[task.id] && subtasks[task.id]?.length > 0 ? (
                                <div className="space-y-1">
                                  {subtasks[task.id].map((subtask) => (
                                    <div 
                                      key={subtask.id} 
                                      className="flex items-center justify-between p-1.5 hover:bg-[#1C2A3A]/60 rounded-sm group"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onTaskClick && onTaskClick(subtask.id);
                                      }}
                                    >
                                      <div className="flex items-center space-x-2">
                                        <Checkbox 
                                          checked={subtask.status === 'completed'}
                                          onCheckedChange={(checked) => {
                                            handleStatusChange(subtask.id, checked ? 'completed' : 'open');
                                          }}
                                          className="data-[state=checked]:bg-neon-green data-[state=checked]:border-neon-green"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                        <span className={`text-sm ${subtask.status === 'completed' ? 'line-through text-[#64748B]' : ''}`}>
                                          {subtask.title || 'Untitled Subtask'}
                                        </span>
                                      </div>
                                      <div className="flex items-center">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                          onClick={(e) => handleDeleteSubtask(subtask.id, e)}
                                        >
                                          <X className="h-3 w-3 text-[#94A3B8] hover:text-[#E11D48]" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-sm text-[#64748B] p-2 text-center">
                                  No subtasks yet. Add one above.
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
