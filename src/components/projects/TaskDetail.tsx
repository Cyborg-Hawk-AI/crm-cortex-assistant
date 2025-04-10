
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
  Plus
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
import { createSubtask, updateTask } from '@/api/tasks';
import { CommentSection } from '@/components/comments/CommentSection';
import { CommentList } from '@/components/comments/CommentList';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newTag, setNewTag] = useState('');
  const [isEditing, setIsEditing] = useState(false); // Global edit mode
  const [date, setDate] = useState<Date | undefined>(
    task.due_date ? new Date(task.due_date) : undefined
  );
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [tags, setTags] = useState<string[]>(task.tags || []);
  const [comments, setComments] = useState<any[]>([]);
  
  // Fetch user profiles to display names instead of UUIDs
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
        
        // Convert array to object with id as key
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

  // Fetch task comments
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
      
      return data || [];
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      return [];
    }
  };

  const { data: taskComments = [] } = useQuery({
    queryKey: ['task-comments', task.id],
    queryFn: fetchComments
  });

  useEffect(() => {
    setComments(taskComments);
  }, [taskComments]);

  const getUserName = (userId: string | null | undefined) => {
    if (!userId) return 'Unassigned';
    
    const profile = profiles[userId];
    if (!profile) return userId.substring(0, 8) + '...';
    
    return profile.full_name || profile.email || userId.substring(0, 8) + '...';
  };
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'closed':
      case 'resolved':
        return 'bg-neon-green/20 text-neon-green border-neon-green/30';
      case 'in progress':
      case 'in-progress':
        return 'bg-neon-blue/20 text-neon-blue border-neon-blue/30';
      case 'open':
      case 'backlog':
        return 'bg-neon-purple/20 text-neon-purple border-neon-purple/30';
      default:
        return 'bg-gray-200/20 text-gray-500 border-gray-300/30';
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch(priority.toLowerCase()) {
      case 'high':
      case 'urgent':
        return 'bg-neon-red/20 text-neon-red border-neon-red/30';
      case 'medium':
        return 'bg-neon-yellow/20 text-neon-yellow border-neon-yellow/30';
      case 'low':
        return 'bg-neon-aqua/20 text-neon-aqua border-neon-aqua/30';
      default:
        return 'bg-gray-200/20 text-gray-500 border-gray-300/30';
    }
  };
  
  const handleDescriptionSave = () => {
    setIsEditingDescription(false);
    saveChanges();
  };
  
  const formatDate = (dateString: string | null | Date) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('default', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const toggleGlobalEdit = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      // When entering edit mode, also enable individual sections
      setIsEditingDescription(true);
      setIsEditingTitle(true);
    } else {
      // When exiting edit mode, save all changes
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

      // Reset editing states
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
    
    // Auto-save tags if not in global edit mode
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
    
    // Auto-save tags if not in global edit mode
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

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          content: newComment.trim(),
          user_id: task.user_id, // Current user ID
          entity_id: task.id,
          entity_type: 'task',
          created_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Add the new comment to the list
      setComments(prevComments => [data, ...prevComments]);
      setNewComment('');
      
      toast({
        title: "Comment added",
        description: "Your comment has been posted",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus as any);
    
    // Auto-save if not in global edit mode
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
    
    // Auto-save if not in global edit mode
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
    
    // Auto-save if not in global edit mode
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
  
  return (
    <div className="bg-[#25384D] flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-[#3A4D62]">
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
      
      <div className="flex-grow p-4 overflow-y-auto space-y-6">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Badge className={getStatusColor(status)}>
                    {status}
                  </Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#25384D] border-[#3A4D62] text-[#F1F5F9]">
                  <DropdownMenuItem onClick={() => handleStatusChange('open')} className="hover:bg-[#3A4D62]/50">
                    Open
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('in-progress')} className="hover:bg-[#3A4D62]/50">
                    In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('resolved')} className="hover:bg-[#3A4D62]/50">
                    Resolved
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('closed')} className="hover:bg-[#3A4D62]/50">
                    Closed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('completed')} className="hover:bg-[#3A4D62]/50">
                    Completed
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Badge className={getPriorityColor(priority)}>
                    {priority}
                  </Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#25384D] border-[#3A4D62] text-[#F1F5F9]">
                  <DropdownMenuItem onClick={() => handlePriorityChange('low')} className="hover:bg-[#3A4D62]/50">
                    <Flag className="mr-2 h-3.5 w-3.5 text-[#64748B]" />
                    Low
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handlePriorityChange('medium')} className="hover:bg-[#3A4D62]/50">
                    <Flag className="mr-2 h-3.5 w-3.5 text-amber-500" />
                    Medium
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handlePriorityChange('high')} className="hover:bg-[#3A4D62]/50">
                    <Flag className="mr-2 h-3.5 w-3.5 text-neon-red" />
                    High
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handlePriorityChange('urgent')} className="hover:bg-[#3A4D62]/50">
                    <Flag className="mr-2 h-3.5 w-3.5 text-neon-red" />
                    Urgent
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mt-2 text-sm text-[#CBD5E1]">
            <div className="flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span>Created: {formatDate(task.created_at)}</span>
            </div>
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
              <PopoverContent className="w-auto p-0 bg-[#25384D] border-[#3A4D62]">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={handleDueDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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
              className="text-sm text-[#CBD5E1] bg-[#1C2A3A]/50 p-3 rounded-md cursor-pointer hover:bg-[#1C2A3A]"
              onClick={() => setIsEditingDescription(true)}
            >
              {task.description || 'No description provided. Click to add one.'}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-[#F1F5F9]">Subtasks</h3>
          </div>
          
          <div className="bg-[#1C2A3A]/50 p-2 rounded-md">
            {subtasks.length > 0 ? (
              <div className="space-y-1 mb-2 max-h-[200px] overflow-y-auto pr-2">
                {subtasks.map(subtask => (
                  <div key={subtask.id} className="flex items-center p-2 hover:bg-[#1C2A3A] rounded-md">
                    <Checkbox 
                      id={subtask.id}
                      checked={subtask.is_completed}
                      className="mr-2"
                    />
                    <label 
                      htmlFor={subtask.id}
                      className={`text-sm flex-grow cursor-pointer ${
                        subtask.is_completed ? 'text-[#718096] line-through' : 'text-[#F1F5F9]'
                      }`}
                    >
                      {subtask.title}
                    </label>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 hover:opacity-100">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-[#718096] p-2 text-center mb-2">
                No subtasks yet. Add one below.
              </div>
            )}

            {/* Always visible add subtask form */}
            <div className="flex items-center gap-2">
              <Input
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Add a subtask..."
                className="flex-1 bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddSubtask();
                  }
                }}
              />
              <Button 
                onClick={handleAddSubtask}
                className="bg-neon-aqua hover:bg-neon-aqua/90 text-black"
                disabled={!newSubtaskTitle.trim()}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
        
        <Separator className="bg-[#3A4D62]" />
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-[#CBD5E1]">Assignee</div>
            {task.assignee_id ? (
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${task.assignee_id}`} />
                  <AvatarFallback>
                    {getUserName(task.assignee_id).substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-[#F1F5F9]">
                  {getUserName(task.assignee_id)}
                </span>
              </div>
            ) : (
              <Button variant="outline" size="sm" className="border-dashed border-[#3A4D62]">
                <User className="h-3.5 w-3.5 mr-1" />
                Assign
              </Button>
            )}
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-[#CBD5E1]">Reporter</div>
            {task.reporter_id && (
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${task.reporter_id}`} />
                  <AvatarFallback>
                    {getUserName(task.reporter_id).substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-[#F1F5F9]">
                  {getUserName(task.reporter_id)}
                </span>
              </div>
            )}
          </div>
          
          <div className="col-span-2 space-y-3">
            <div className="text-sm text-[#CBD5E1]">Tags</div>
            <div className="space-y-3">
              {tags && tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="bg-[#1C2A3A] flex items-center gap-1 group">
                      {tag}
                      <X 
                        className="h-3 w-3 opacity-50 group-hover:opacity-100 cursor-pointer" 
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              ) : null}
              
              <div className="flex items-center gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  className="flex-1 bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddTag();
                    }
                  }}
                />
                <Button 
                  onClick={handleAddTag}
                  variant="outline"
                  className="border-[#3A4D62]"
                  disabled={!newTag.trim() || tags.includes(newTag.trim())}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <Separator className="bg-[#3A4D62]" />
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-[#F1F5F9] flex items-center">
              <MessageSquare className="h-4 w-4 mr-1" />
              Comments
            </h3>
          </div>
          
          <div className="bg-[#1C2A3A]/50 p-4 rounded-md">
            {/* Comments with scrolling */}
            <CommentList comments={comments} />
            
            {/* Inline comment editor */}
            <div className="flex items-start gap-2 mt-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${task.user_id}`} />
                <AvatarFallback>
                  {getUserName(task.user_id).substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9] min-h-[80px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <div className="mt-2 flex justify-end">
                  <Button 
                    onClick={handleAddComment}
                    className="bg-neon-aqua hover:bg-neon-aqua/90 text-black"
                    disabled={!newComment.trim()}
                  >
                    <Send className="h-3.5 w-3.5 mr-1" />
                    Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
