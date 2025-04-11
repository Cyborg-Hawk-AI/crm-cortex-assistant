
// Import necessary components and utilities
import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle,
  Calendar,
  Check,
  CheckCheck,
  Circle,
  CircleX,
  Clock3,
  Clock4,
  Flag, 
  MessageSquareText,
  Trash2,
  User,
  X
} from 'lucide-react';
import { Task, SubTask } from '@/utils/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { TaskStatusDropdown } from '@/components/mission/TaskStatusDropdown';
import { TaskPriorityDropdown } from '@/components/mission/TaskPriorityDropdown';
import { useToast } from '@/hooks/use-toast';
import { updateTaskField } from '@/utils/taskHelpers';

// TaskDetail component props
interface TaskDetailProps {
  task: Task;
  subtasks?: SubTask[] | any[]; // Add the subtasks property
  onClose: () => void;
  onUpdate: (updatedTask: Task) => void; // Required prop
  onDelete?: (taskId: string) => void;
  onRefresh?: () => void; // Optional refresh callback
}

// TaskDetail component
export function TaskDetail({ 
  task, 
  subtasks = [], 
  onClose, 
  onUpdate, 
  onDelete, 
  onRefresh 
}: TaskDetailProps) {
  // State for form fields and UI
  const [title, setTitle] = useState<string>(task.title);
  const [description, setDescription] = useState<string>(task.description || '');
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [isEditingDescription, setIsEditingDescription] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [descriptionOverflow, setDescriptionOverflow] = useState<boolean>(false);
  const { toast } = useToast();
  
  console.log(`[DEBUG-TaskDetail] Component rendered with task:`, task);
  console.log(`[DEBUG-TaskDetail] Subtasks received:`, subtasks);
  console.log(`[DEBUG-TaskDetail] onUpdate prop available:`, !!onUpdate);
  console.log(`[DEBUG-TaskDetail] onRefresh prop available:`, !!onRefresh);
  
  const statusOptions = [
    { value: 'open', label: 'Open', icon: Circle, color: 'bg-[#3A4D62] text-[#F1F5F9] border-[#3A4D62]/50' },
    { value: 'in-progress', label: 'In Progress', icon: Clock3, color: 'bg-neon-blue/20 text-neon-blue border-neon-blue/30' },
    { value: 'resolved', label: 'Resolved', icon: Check, color: 'bg-neon-aqua/20 text-neon-aqua border-neon-aqua/30' },
    { value: 'closed', label: 'Closed', icon: CircleX, color: 'bg-gray-200/20 text-gray-500 border-gray-300/30' },
    { value: 'completed', label: 'Completed', icon: CheckCheck, color: 'bg-neon-green/20 text-neon-green border-neon-green/30' }
  ];
  
  const priorityOptions = [
    { value: 'low', label: 'Low', icon: Flag, color: 'bg-neon-blue/20 text-neon-blue border-neon-blue/30' },
    { value: 'medium', label: 'Medium', icon: Flag, color: 'bg-amber-500/20 text-amber-500 border-amber-500/30' },
    { value: 'high', label: 'High', icon: Flag, color: 'bg-neon-red/20 text-neon-red border-neon-red/30' },
    { value: 'urgent', label: 'Urgent', icon: AlertTriangle, color: 'bg-neon-purple/20 text-neon-purple border-neon-purple/30' }
  ];
  
  const descriptionRef = useRef<HTMLDivElement>(null);
  
  // Check if description has overflow for "Show more" button
  useEffect(() => {
    const checkOverflow = () => {
      const element = descriptionRef.current;
      if (element) {
        setDescriptionOverflow(
          element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth
        );
      }
    };
    
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [description]);

  // Format the status display
  const getStatusDisplay = () => {
    const status = statusOptions.find(s => s.value === task.status) || statusOptions[0];
    const StatusIcon = status.icon;
    return { ...status, icon: StatusIcon };
  };
  
  // Format the priority display
  const getPriorityDisplay = () => {
    const priority = priorityOptions.find(p => p.value === task.priority) || priorityOptions[0];
    const PriorityIcon = priority.icon;
    return { ...priority, icon: PriorityIcon };
  };

  // Handle task title change
  const handleTitleSave = async () => {
    console.log(`[DEBUG-TaskDetail] Saving title: "${title}"`);
    
    if (title.trim() === '') {
      console.log(`[DEBUG-TaskDetail] Title validation failed - empty title`);
      toast({
        title: "Invalid title",
        description: "Title cannot be empty",
        variant: "destructive"
      });
      setTitle(task.title);
      setIsEditingTitle(false);
      return;
    }
    
    if (title === task.title) {
      console.log(`[DEBUG-TaskDetail] Title unchanged, skipping update`);
      setIsEditingTitle(false);
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log(`[DEBUG-TaskDetail] Updating task title from "${task.title}" to "${title}"`);
      const updatedTask = await updateTaskField(
        task,
        'title',
        title,
        {
          onSuccess: () => {
            toast({
              title: "Title updated",
              description: "Task title has been updated"
            });
          }
        }
      );
      
      console.log(`[DEBUG-TaskDetail] Title update successful:`, updatedTask);
      onUpdate(updatedTask);
    } catch (error) {
      console.error(`[DEBUG-TaskDetail] Error saving title:`, error);
      setTitle(task.title);
      toast({
        title: "Error",
        description: "Failed to update task title",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      setIsEditingTitle(false);
    }
  };

  // Handle description change
  const handleDescriptionSave = async () => {
    console.log(`[DEBUG-TaskDetail] Saving description`);
    
    if (description === task.description) {
      console.log(`[DEBUG-TaskDetail] Description unchanged, skipping update`);
      setIsEditingDescription(false);
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log(`[DEBUG-TaskDetail] Updating task description`);
      const updatedTask = await updateTaskField(
        task,
        'description',
        description,
        {
          onSuccess: () => {
            toast({
              title: "Description updated",
              description: "Task description has been updated"
            });
          }
        }
      );
      
      console.log(`[DEBUG-TaskDetail] Description update successful:`, updatedTask);
      onUpdate(updatedTask);
    } catch (error) {
      console.error(`[DEBUG-TaskDetail] Error saving description:`, error);
      setDescription(task.description || '');
      toast({
        title: "Error",
        description: "Failed to update task description",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      setIsEditingDescription(false);
    }
  };

  // Handle task status update
  const handleStatusChange = async (newStatus: string) => {
    console.log(`[DEBUG-TaskDetail] Status change requested: ${task.status} -> ${newStatus}`);
    
    if (newStatus === task.status) {
      console.log(`[DEBUG-TaskDetail] Status unchanged, skipping update`);
      return;
    }
    
    try {
      console.log(`[DEBUG-TaskDetail] Updating task status to "${newStatus}"`);
      const updatedTask = await updateTaskField(
        task,
        'status',
        newStatus,
        {
          onSuccess: () => {
            console.log(`[DEBUG-TaskDetail] Status update successful`);
            toast({
              title: "Status updated",
              description: `Task status has been changed to ${getStatusDisplay().label}`
            });
          }
        }
      );
      
      console.log(`[DEBUG-TaskDetail] Status update completed, task data:`, updatedTask);
      onUpdate(updatedTask);
      if (onRefresh) onRefresh(); // Call onRefresh if it exists
    } catch (error) {
      console.error(`[DEBUG-TaskDetail] Error updating status:`, error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive"
      });
    }
  };

  // Handle task priority update
  const handlePriorityChange = async (newPriority: string) => {
    console.log(`[DEBUG-TaskDetail] Priority change requested: ${task.priority} -> ${newPriority}`);
    
    if (newPriority === task.priority) {
      console.log(`[DEBUG-TaskDetail] Priority unchanged, skipping update`);
      return;
    }
    
    try {
      console.log(`[DEBUG-TaskDetail] Updating task priority to "${newPriority}"`);
      const updatedTask = await updateTaskField(
        task,
        'priority',
        newPriority,
        {
          onSuccess: () => {
            console.log(`[DEBUG-TaskDetail] Priority update successful`);
            toast({
              title: "Priority updated",
              description: `Task priority has been changed to ${getPriorityDisplay().label}`
            });
          }
        }
      );
      
      console.log(`[DEBUG-TaskDetail] Priority update completed, task data:`, updatedTask);
      onUpdate(updatedTask);
      if (onRefresh) onRefresh(); // Call onRefresh if it exists
    } catch (error) {
      console.error(`[DEBUG-TaskDetail] Error updating priority:`, error);
      toast({
        title: "Error",
        description: "Failed to update task priority",
        variant: "destructive"
      });
    }
  };

  // Handle task deletion
  const handleDeleteTask = () => {
    console.log(`[DEBUG-TaskDetail] Delete task requested for task ${task.id}`);
    if (onDelete) {
      onDelete(task.id);
    }
  };

  // Get formatted date strings
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'No date set';
    try {
      console.log(`[DEBUG-TaskDetail] Formatting date: ${dateString}, type: ${typeof dateString}`);
      // Fix: Convert string or Date to Date object and then format
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return format(date, 'PPP');
    } catch (e) {
      console.error(`[DEBUG-TaskDetail] Error formatting date:`, e);
      return 'Invalid date';
    }
  };

  // Handle keyboard shortcuts for editing
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setTitle(task.title);
      setIsEditingTitle(false);
    }
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      handleDescriptionSave();
    } else if (e.key === 'Escape') {
      setDescription(task.description || '');
      setIsEditingDescription(false);
    }
  };

  // Component render
  return (
    <>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          {isEditingTitle ? (
            <div className="pr-4">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyDown}
                className="text-xl font-semibold bg-[#1C2A3A] border-neon-aqua/50"
                autoFocus
                disabled={isSubmitting}
              />
            </div>
          ) : (
            <h2 
              className="text-xl font-semibold line-clamp-2 hover:bg-[#1C2A3A]/50 px-2 py-1 rounded cursor-pointer"
              onClick={() => {
                console.log('[DEBUG-TaskDetail] Title clicked, entering edit mode');
                setIsEditingTitle(true);
              }}
            >
              {title}
            </h2>
          )}
          
          <div className="text-[#CBD5E1] text-sm mt-1">
            <span>Created: {formatDate(task.created_at)}</span>
            {task.due_date && (
              <span className="ml-4">Due: {formatDate(task.due_date)}</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0 hover:bg-[#3A4D62]/50"
            onClick={() => {
              console.log('[DEBUG-TaskDetail] Close button clicked');
              onClose();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <div 
            className="relative" 
            onClick={() => {
              console.log('[DEBUG-TaskDetail] Status area clicked manually');
            }}
          >
            <TaskStatusDropdown
              currentStatus={task.status || 'open'}
              onChange={handleStatusChange}
            />
          </div>
          
          <div 
            className="relative"
            onClick={() => {
              console.log('[DEBUG-TaskDetail] Priority area clicked manually');
            }}
          >
            <TaskPriorityDropdown
              currentPriority={task.priority || 'medium'}
              onChange={handlePriorityChange}
              displayAsBadge={true}
            />
          </div>
        </div>
        
        <div>
          <Button
            variant="outline"
            size="sm"
            className="text-neon-red border-neon-red/30 hover:bg-neon-red/10"
            onClick={handleDeleteTask}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="space-y-4">
        <div>
          <h3 className="text-[#F1F5F9] font-medium mb-2 flex items-center">
            <MessageSquareText className="h-4 w-4 mr-2 opacity-70" />
            Description
          </h3>
          {isEditingDescription ? (
            <div className="mt-2">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescriptionSave}
                onKeyDown={handleDescriptionKeyDown}
                className="min-h-[120px] bg-[#1C2A3A] border-[#3A4D62] resize-y"
                placeholder="Add a description..."
                autoFocus
                disabled={isSubmitting}
              />
              <div className="flex justify-end mt-2 space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    console.log('[DEBUG-TaskDetail] Description edit cancelled');
                    setDescription(task.description || '');
                    setIsEditingDescription(false);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={handleDescriptionSave}
                  disabled={isSubmitting}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="prose prose-invert max-w-none hover:bg-[#1C2A3A]/50 p-2 rounded cursor-pointer"
              onClick={() => {
                console.log('[DEBUG-TaskDetail] Description area clicked, entering edit mode');
                setIsEditingDescription(true);
              }}
            >
              <div
                ref={descriptionRef}
                className={`${descriptionOverflow ? 'max-h-[120px]' : ''} overflow-hidden`}
              >
                {description ? (
                  <div dangerouslySetInnerHTML={{ __html: description }} />
                ) : (
                  <p className="text-[#64748B] italic">No description provided. Click to add one.</p>
                )}
              </div>
              {descriptionOverflow && (
                <Button 
                  variant="link" 
                  size="sm" 
                  className="mt-2 p-0 h-auto text-neon-aqua"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingDescription(true);
                  }}
                >
                  Show more
                </Button>
              )}
            </div>
          )}
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-[#F1F5F9] font-medium mb-2 flex items-center">
            <User className="h-4 w-4 mr-2 opacity-70" />
            Assigned to
          </h3>
          <Badge variant="outline" className="border-[#3A4D62] text-[#CBD5E1]">
            {task.assignee_id || 'Unassigned'}
          </Badge>
        </div>
        
        {task.parent_task_id && (
          <>
            <Separator />
            <div>
              <h3 className="text-[#F1F5F9] font-medium mb-2">Parent Task</h3>
              <Badge variant="outline" className="border-[#3A4D62] text-[#CBD5E1]">
                {task.parent_task_id}
              </Badge>
            </div>
          </>
        )}
        
        {task.tags && task.tags.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-[#F1F5F9] font-medium mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="border-[#3A4D62] text-[#CBD5E1]">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
