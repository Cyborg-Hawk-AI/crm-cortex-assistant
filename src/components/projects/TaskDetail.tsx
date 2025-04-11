
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Edit2, 
  MessageSquare, 
  MoreHorizontal, 
  PlusCircle, 
  Tag, 
  User, 
  X,
  Send,
  Calendar,
  Flag,
  Check,
  Plus,
  CheckCheck,
  Circle,
  CircleCheck,
  CircleX,
  Clock3,
  ClockIcon,
  AlertTriangle,
  Save,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Task, SubTask } from '@/utils/types';
import { useToast } from '@/hooks/use-toast';
import { createSubtask, updateTask, deleteTask, updateSubtask } from '@/api/tasks';
import { CommentSection } from '@/components/comments/CommentSection';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/utils/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TaskStatusDropdown } from '@/components/mission/TaskStatusDropdown';
import { TaskPriorityDropdown } from '@/components/mission/TaskPriorityDropdown';

interface TaskDetailProps {
  task: Task;
  subtasks?: SubTask[];
  onClose: () => void;
  onUpdate?: (task: Task) => void;
  onRefresh: () => void;
}

export function TaskDetail({ task, subtasks = [], onClose, onUpdate, onRefresh }: TaskDetailProps) {
  const { toast } = useToast();
  const [description, setDescription] = useState(task.description || '');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isExpandedDescription, setIsExpandedDescription] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newTag, setNewTag] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    task.due_date ? new Date(task.due_date) : undefined
  );
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [tags, setTags] = useState<string[]>(task.tags || []);
  const [comments, setComments] = useState<any[]>([]);
  
  const [descriptionHeight, setDescriptionHeight] = useState<string>('auto');
  const [descriptionOverflow, setDescriptionOverflow] = useState<boolean>(false);
  
  const statusOptions = [
    { value: 'open', label: 'Open', icon: Circle, color: 'bg-[#3A4D62] text-[#F1F5F9] border-[#3A4D62]/50' },
    { value: 'in-progress', label: 'In Progress', icon: Clock3, color: 'bg-neon-blue/20 text-neon-blue border-neon-blue/30' },
    { value: 'resolved', label: 'Resolved', icon: Check, color: 'bg-neon-aqua/20 text-neon-aqua border-neon-aqua/30' },
    { value: 'closed', label: 'Closed', icon: CircleX, color: 'bg-gray-200/20 text-gray-500 border-gray-300/30' },
    { value: 'completed', label: 'Completed', icon: CircleCheck, color: 'bg-neon-green/20 text-neon-green border-neon-green/30' },
  ];
  
  const priorityOptions = [
    { value: 'low', label: 'Low', icon: Flag, color: 'bg-neon-aqua/20 text-neon-aqua border-neon-aqua/30' },
    { value: 'medium', label: 'Medium', icon: Flag, color: 'bg-neon-yellow/20 text-neon-yellow border-neon-yellow/30' },
    { value: 'high', label: 'High', icon: Flag, color: 'bg-neon-red/20 text-neon-red border-neon-red/30' },
    { value: 'urgent', label: 'Urgent', icon: AlertTriangle, color: 'bg-neon-red/20 text-neon-red border-neon-red/30' },
  ];

  const { data: profiles = {}, isLoading: loadingProfiles } = useQuery({
    queryKey: ['user-profiles'],
    queryFn: async () => {
      try {
        const userIds = [task.assignee_id, task.reporter_id, task.user_id].filter(Boolean);
        if (userIds.length === 0) return {};
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);
          
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
    }
  });

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('entity_id', task.id)
        .eq('entity_type', 'task')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching comments:', error);
        return [];
      }
      
      if (data && data.length > 0) {
        const userIds = data.map(comment => comment.user_id);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);
          
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        } else if (profilesData) {
          const profileMap: Record<string, any> = {};
          profilesData.forEach(profile => {
            profileMap[profile.id] = profile;
          });
          
          return data.map(comment => ({
            ...comment,
            profiles: profileMap[comment.user_id] || {}
          }));
        }
      }
      
      return data || [];
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      return [];
    }
  };

  const { data: taskComments = [], refetch: refetchComments } = useQuery({
    queryKey: ['task-comments', task.id],
    queryFn: fetchComments
  });

  useEffect(() => {
    setComments(taskComments);
  }, [taskComments, task.id]);

  useEffect(() => {
    refetchComments();
  }, []);
  
  useEffect(() => {
    if (task.description) {
      const checkOverflow = () => {
        const descLength = task.description?.length || 0;
        setDescriptionOverflow(descLength > 150);
      };
      
      checkOverflow();
    }
  }, [task.description]);

  const getUserName = (userId: string | null | undefined) => {
    if (!userId) return 'Unassigned';
    
    const profile = profiles[userId];
    if (!profile) return userId.substring(0, 8) + '...';
    
    return profile.full_name || profile.email || userId.substring(0, 8) + '...';
  };

  const getStatusColor = (statusValue: string) => {
    const option = statusOptions.find(opt => opt.value === statusValue);
    return option?.color || 'bg-gray-200/20 text-gray-500 border-gray-300/30';
  };

  const getPriorityColor = (priorityValue: string) => {
    const option = priorityOptions.find(opt => opt.value === priorityValue);
    return option?.color || 'bg-gray-200/20 text-gray-500 border-gray-300/30';
  };
  
  const getStatusIcon = (statusValue: string) => {
    const option = statusOptions.find(opt => opt.value === statusValue);
    return option?.icon || Circle;
  };
  
  const getPriorityIcon = (priorityValue: string) => {
    const option = priorityOptions.find(opt => opt.value === priorityValue);
    return option?.icon || Flag;
  };

  const handleDescriptionSave = () => {
    setIsEditingDescription(false);
    saveChanges();
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return null;
    
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
      const formattedDate = format(date, 'MMM d, yyyy');
      return formattedDate;
    } catch (error) {
      console.error("Error formatting date:", error);
      return String(dateString);
    }
  };

  const toggleGlobalEdit = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setIsEditingDescription(true);
      setIsEditingTitle(true);
    } else {
      saveChanges();
    }
  };

  const saveChanges = async () => {
    try {
      const updatedTask = {
        ...task,
        title,
        description,
        status,
        priority,
        due_date: date ? date.toISOString() : null,
        tags
      };
      
      await updateTask(updatedTask);
      
      toast({
        title: "Changes saved",
        description: "Task has been updated successfully",
      });
      
      if (onRefresh) {
        onRefresh();
      }

      setIsEditingTitle(false);
      setIsEditingDescription(false);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving changes:", error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;
    
    try {
      await createSubtask({
        title: newSubtaskTitle,
        parent_task_id: task.id,
        user_id: task.user_id,
        is_completed: false,
        created_by: task.user_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      
      setNewSubtaskTitle('');
      toast({
        title: "Subtask added",
        description: "New subtask has been created",
      });
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error creating subtask:", error);
      toast({
        title: "Error",
        description: "Failed to create subtask. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddTag = () => {
    if (!newTag.trim() || tags.includes(newTag.trim())) return;
    
    const updatedTags = [...tags, newTag.trim()];
    setTags(updatedTags);
    setNewTag('');
    
    if (!isEditing) {
      try {
        updateTask({
          ...task,
          tags: updatedTags
        });
        
        toast({
          title: "Tag added",
          description: "Tag has been added to the task",
        });
        
        if (onRefresh) {
          onRefresh();
        }
      } catch (error) {
        console.error("Error adding tag:", error);
        toast({
          title: "Error",
          description: "Failed to add tag. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    
    if (!isEditing) {
      try {
        updateTask({
          ...task,
          tags: updatedTags
        });
        
        toast({
          title: "Tag removed",
          description: "Tag has been removed from the task",
        });
        
        if (onRefresh) {
          onRefresh();
        }
      } catch (error) {
        console.error("Error removing tag:", error);
        toast({
          title: "Error",
          description: "Failed to remove tag. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddComment = async (commentContent: string) => {
    if (!commentContent.trim()) return;
    
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        toast({
          title: "Error",
          description: "You must be logged in to add comments",
          variant: "destructive"
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('comments')
        .insert({
          content: commentContent.trim(),
          user_id: userId,
          entity_id: task.id,
          entity_type: 'task',
          created_at: new Date().toISOString()
        })
        .select();
        
      if (error) throw error;
      
      await refetchComments();
      
      toast({
        title: "Comment added",
        description: "Your comment has been posted",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus as any);
    
    if (!isEditing) {
      try {
        updateTask({
          ...task,
          status: newStatus as any
        });
        
        toast({
          title: "Status updated",
          description: `Task status changed to ${newStatus}`,
        });
        
        if (onRefresh) {
          onRefresh();
        }
      } catch (error) {
        console.error("Error updating status:", error);
        toast({
          title: "Error",
          description: "Failed to update status. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handlePriorityChange = (newPriority: string) => {
    setPriority(newPriority as any);
    
    if (!isEditing) {
      try {
        updateTask({
          ...task,
          priority: newPriority as any
        });
        
        toast({
          title: "Priority updated",
          description: `Task priority changed to ${newPriority}`,
        });
        
        if (onRefresh) {
          onRefresh();
        }
      } catch (error) {
        console.error("Error updating priority:", error);
        toast({
          title: "Error",
          description: "Failed to update priority. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDueDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    
    if (!isEditing) {
      try {
        updateTask({
          ...task,
          due_date: newDate ? newDate.toISOString() : null
        });
        
        toast({
          title: "Due date updated",
          description: newDate 
            ? `Due date set to ${format(newDate, 'MMM d, yyyy')}` 
            : "Due date removed",
        });
        
        if (onRefresh) {
          onRefresh();
        }
      } catch (error) {
        console.error("Error updating due date:", error);
        toast({
          title: "Error",
          description: "Failed to update due date. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const toggleDescriptionExpand = () => {
    if (!isEditing && !isEditingDescription) {
      setIsExpandedDescription(!isExpandedDescription);
    }
  };

  const deleteSubtask = async (subtaskId: string): Promise<void> => {
    try {
      await deleteTask(subtaskId);
      
      if (onRefresh) {
        onRefresh();
      }
      
      toast({
        title: "Subtask deleted",
        description: "The subtask has been removed successfully"
      });
      
    } catch (error) {
      console.error("Error deleting subtask:", error);
      toast({
        title: "Error",
        description: "Failed to delete subtask. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleToggleSubtaskCompletion = async (subtask: SubTask) => {
    try {
      const updatedSubtask = {
        ...subtask,
        is_completed: !subtask.is_completed,
        updated_at: new Date().toISOString()
      };
      
      await updateSubtask(updatedSubtask);
      
      toast({
        title: updatedSubtask.is_completed ? "Subtask completed" : "Subtask reopened",
        description: updatedSubtask.is_completed ? 
          "Subtask marked as completed" : 
          "Subtask marked as not completed"
      });
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error updating subtask completion status:", error);
      toast({
        title: "Error",
        description: "Failed to update subtask status. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="bg-[#25384D] flex flex-col h-full max-h-screen overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#3A4D62] flex-shrink-0">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 mr-2" 
            onClick={onClose}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-medium text-[#F1F5F9]">
            Task Details
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <Button 
              variant="default"
              size="sm" 
              className="bg-neon-aqua text-black hover:bg-neon-aqua/80"
              onClick={saveChanges}
            >
              Save All
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="border-[#3A4D62]"
              onClick={toggleGlobalEdit}
            >
              <Edit2 className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 h-[calc(100vh-5rem)]" hideScrollbar={false}>
        <div className="p-4 space-y-6 pb-24">
          <div>
            <div className="flex items-start justify-between">
              {isEditingTitle || isEditing ? (
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-xl font-bold text-[#F1F5F9] bg-[#1C2A3A] border-neon-aqua/50"
                  onBlur={() => !isEditing && saveChanges()}
                />
              ) : (
                <h1 
                  className="text-xl font-bold text-[#F1F5F9] cursor-pointer hover:text-neon-aqua/80"
                  onClick={() => setIsEditingTitle(true)}
                >
                  {title}
                </h1>
              )}
              <div className="flex space-x-2">
                {isEditing && (
                  <>
                    <div className="z-50">
                      <TaskStatusDropdown 
                        currentStatus={status} 
                        onChange={(value) => handleStatusChange(value)}
                      />
                    </div>
                    
                    <div className="z-40">
                      <TaskPriorityDropdown
                        currentPriority={priority}
                        onChange={(value) => handlePriorityChange(value)}
                      />
                    </div>
                  </>
                )}
                
                {!isEditing && (
                  <>
                    <Badge 
                      className={`${getStatusColor(status)} cursor-default flex items-center gap-1.5`}
                    >
                      {status}
                    </Badge>
                    <Badge 
                      className={`${getPriorityColor(priority)} cursor-default flex items-center gap-1.5`}
                    >
                      {priority}
                    </Badge>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4 mt-2 text-sm text-[#CBD5E1]">
              <div className="flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>Created: {formatDate(task.created_at)}</span>
              </div>
              {isEditing ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "justify-start text-left font-normal border-[#3A4D62] hover:border-[#64748B] hover:bg-[#3A4D62]/30",
                        !date && "text-[#64748B]"
                      )}
                    >
                      <Calendar className="mr-2 h-3.5 w-3.5" />
                      {date ? format(date, 'MMM d, yyyy') : <span>Set due date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#25384D] border-[#3A4D62] z-50">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={handleDueDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              ) : date ? (
                <div className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  <span>Due: {formatDate(date)}</span>
                </div>
              ) : null}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-[#F1F5F9]">Description</h3>
              {!isEditing && !isEditingDescription && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsEditingDescription(true)}
                >
                  <Edit2 className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
              )}
            </div>
            
            {isEditingDescription || isEditing ? (
              <div className="space-y-2">
                <Textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border border-[#3A4D62] rounded-md bg-[#1C2A3A] text-[#F1F5F9] min-h-[100px]"
                  placeholder="Add a description..."
                />
                {!isEditing && (
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setIsEditingDescription(false);
                        setDescription(task.description || '');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={handleDescriptionSave}
                    >
                      Save
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div 
                className={`text-sm text-[#CBD5E1] bg-[#1C2A3A]/50 p-3 rounded-md cursor-pointer transition-all duration-300 ease-in-out 
                  ${isExpandedDescription ? 'max-h-none' : 'max-h-[80px] overflow-hidden'}`}
                onClick={toggleDescriptionExpand}
              >
                {task.description ? (
                  <>
                    <div className="whitespace-pre-wrap">{task.description}</div>
                    {descriptionOverflow && !isExpandedDescription && (
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#1C2A3A] to-transparent pointer-events-none" />
                    )}
                    {descriptionOverflow && (
                      <div className="text-xs text-neon-aqua mt-2 text-center">
                        {isExpandedDescription ? 'Click to collapse' : 'Click to expand'}
                      </div>
                    )}
                  </>
                ) : (
                  'No description provided. Click "Edit" to add one.'
                )}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-[#F1F5F9]">Subtasks</h3>
            </div>
            
            <div className="bg-[#1C2A3A]/50 p-2 rounded-md">
              {subtasks && subtasks.length > 0 ? (
                <div className="space-y-1 mb-2 max-h-[200px] overflow-y-auto pr-2">
                  {subtasks.map(subtask => (
                    <div key={subtask.id} className="flex items-center p-2 hover:bg-[#1C2A3A] rounded-md group">
                      <Checkbox 
                        id={subtask.id}
                        checked={subtask.is_completed}
                        onCheckedChange={() => handleToggleSubtaskCompletion(subtask)}
                        className="mr-2"
                      />
                      <label 
                        htmlFor={subtask.id}
                        className={`text-sm flex-grow cursor-pointer ${
                          subtask.is_completed ? 'text-[#718096] line-through' : 'text-[#F1F5F9]'
                        }`}
                        onClick={() => handleToggleSubtaskCompletion(subtask)}
                      >
                        {subtask.title}
                      </label>
                      <Button
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={() => deleteSubtask(subtask.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-[#64748B] p-2">No subtasks yet</div>
              )}
              
              <div className="flex items-center mt-2">
                <Input
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Add a subtask..."
                  className="flex-1 bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9] mr-2"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddSubtask();
                    }
                  }}
                />
                <Button 
                  onClick={handleAddSubtask}
                  disabled={!newSubtaskTitle.trim()}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-[#F1F5F9]">
                Comments {comments.length > 0 && `(${comments.length})`}
              </h3>
            </div>
            
            <CommentSection 
              taskId={task.id}
              comments={comments}
              onAddComment={handleAddComment}
              userId={task.user_id}
              onRefreshComments={refetchComments}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-[#F1F5F9]">Tags</h3>
            </div>
            
            <div className="bg-[#1C2A3A]/50 p-3 rounded-md">
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.length > 0 ? (
                  tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      className="bg-[#3A4D62]/50 hover:bg-[#3A4D62] text-[#F1F5F9] gap-1 pl-2"
                    >
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-[#E11D48]" 
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-[#64748B]">No tags yet</span>
                )}
              </div>
              
              <div className="flex items-center">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  className="flex-1 bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9] mr-2"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddTag();
                    }
                  }}
                />
                <Button 
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
