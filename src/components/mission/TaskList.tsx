
import React, { useState, useRef, useEffect } from 'react';
import { Check, Circle, Clock, AlertCircle, Plus, Trash2, Calendar, ChevronRight, ChevronDown, Edit2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { useMissionTasks } from '@/hooks/useMissionTasks';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Task } from '@/utils/types';
import { useToast } from '@/hooks/use-toast';

interface TaskListProps {
  missionId: string;
}

export function TaskList({ missionId }: TaskListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [dueDate, setDueDate] = useState<string>('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const titleInputRef = useRef<HTMLInputElement>(null);

  const {
    tasks,
    isLoading,
    missionExists,
    currentUserId,
    createTask,
    updateTaskStatus,
    updateTaskTitle,
    deleteTask,
    isCreating,
    getSubtasks,
    subtasks
  } = useMissionTasks(missionId);

  useEffect(() => {
    if (editingTaskId && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [editingTaskId]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUserId) {
      toast({
        title: "Error",
        description: "You need to be signed in to create tasks.",
        variant: "destructive"
      });
      return;
    }
    
    if (newTaskTitle.trim()) {
      createTask(newTaskTitle.trim(), null); // null parent_task_id for top-level tasks
      setNewTaskTitle('');
      setDueDate('');
      setShowAddForm(false);
    }
  };

  const handleTaskTitleChange = (task: Task) => {
    if (editingTaskTitle.trim() && editingTaskTitle !== task.title) {
      updateTaskTitle(task.id, editingTaskTitle);
    }
    setEditingTaskId(null);
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  const toggleExpand = (taskId: string) => {
    setExpandedTasks(prev => {
      const isCurrentlyExpanded = prev[taskId];
      
      if (!isCurrentlyExpanded) {
        // Only fetch subtasks when expanding
        getSubtasks(taskId);
      }
      
      return {
        ...prev,
        [taskId]: !isCurrentlyExpanded
      };
    });
  };

  const handleCreateSubtask = (parentTaskId: string) => {
    if (newTaskTitle.trim()) {
      createTask(newTaskTitle.trim(), parentTaskId);
      setNewTaskTitle('');
      setDueDate('');
    }
  };
  
  const formatDueDate = (dateString?: string | Date) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (e) {
      return null;
    }
  };

  const renderTask = (task: Task, isSubtask = false) => {
    const hasSubtasks = subtasks[task.id]?.length > 0;
    const isExpanded = expandedTasks[task.id] || false;
    
    return (
      <div key={task.id} className="mb-2">
        <div 
          className={cn(
            "p-3 rounded flex items-start gap-3 group border",
            task.status === 'completed' 
              ? "bg-[#1C2A3A]/30 border-[#3A4D62]/30" 
              : "bg-[#1C2A3A]/50 border-[#3A4D62]",
            isSubtask && "ml-6"
          )}
        >
          <div className="flex flex-col items-center gap-1">
            <Checkbox
              checked={task.status === 'completed'}
              onCheckedChange={(checked) => {
                const newStatus = checked ? 'completed' : 'open';
                updateTaskStatus(task.id, newStatus);
              }}
              className="mt-1"
            />
            
            {hasSubtasks && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExpand(task.id)}
                className="h-5 w-5 p-0 text-[#64748B]"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            )}
          </div>
          
          <div 
            className="flex-1 min-w-0"
            onClick={() => handleTaskClick(task.id)}
          >
            {editingTaskId === task.id ? (
              <Input
                ref={titleInputRef}
                value={editingTaskTitle}
                onChange={(e) => setEditingTaskTitle(e.target.value)}
                onBlur={() => handleTaskTitleChange(task)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTaskTitleChange(task);
                  }
                }}
                className="mb-1 py-0 h-6 bg-[#1C2A3A] border-[#3A4D62]"
              />
            ) : (
              <div className="flex items-center gap-1">
                <span 
                  className={cn(
                    "block text-sm cursor-pointer",
                    task.status === 'completed' && "line-through text-[#64748B]"
                  )}
                >
                  {task.title}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingTaskId(task.id);
                    setEditingTaskTitle(task.title);
                  }}
                  className="opacity-0 group-hover:opacity-100 h-5 w-5 p-0 text-[#64748B] hover:text-[#F1F5F9]"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            {task.due_date && (
              <span className="text-xs text-[#64748B] flex items-center mt-1">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDueDate(task.due_date)}
              </span>
            )}
            
            {!isSubtask && !hasSubtasks && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setNewTaskTitle('');
                  toggleExpand(task.id);
                }}
                className="opacity-0 group-hover:opacity-100 mt-1 h-5 text-xs text-[#64748B] hover:text-neon-aqua p-0"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add subtask
              </Button>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              deleteTask(task.id);
            }}
            className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 text-[#64748B] hover:text-red-400 hover:bg-red-400/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Subtasks section */}
        {isExpanded && (
          <>
            {subtasks[task.id]?.map((subtask) => renderTask(subtask, true))}
            
            {/* Add subtask form */}
            <div className="ml-6 mt-2 mb-3 bg-[#1C2A3A]/30 p-2 rounded-md border border-[#3A4D62]/50">
              <Input
                placeholder="Add subtask..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="mb-2 bg-[#1C2A3A] border-[#3A4D62]"
              />
              <div className="flex justify-end gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setNewTaskTitle('')}
                  className="text-xs h-7 border-[#3A4D62] text-[#F1F5F9]"
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => handleCreateSubtask(task.id)}
                  disabled={!newTaskTitle.trim()}
                  className="text-xs h-7"
                >
                  Add
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="h-6 bg-[#3A4D62]/30 rounded animate-pulse mb-3"></div>
        <div className="h-6 bg-[#3A4D62]/30 rounded animate-pulse mb-3"></div>
        <div className="h-6 bg-[#3A4D62]/30 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div className="p-4 text-center">
        <p className="text-[#64748B] mb-2">You need to be signed in to view and manage tasks.</p>
        <p className="text-[#64748B] text-sm">Please sign in to continue.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#25384D]/30 rounded-md border border-[#3A4D62] p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-[#F1F5F9]">Mission Tasks</h3>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)} 
          size="sm" 
          className="bg-neon-aqua/20 hover:bg-neon-aqua/30 text-neon-aqua"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Task
        </Button>
      </div>
      
      {showAddForm && (
        <form onSubmit={handleCreateTask} className="mb-4 bg-[#1C2A3A]/50 p-3 rounded-md border border-[#3A4D62]">
          <div className="mb-2">
            <Input
              placeholder="Task title..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="mb-2 bg-[#1C2A3A] border-[#3A4D62]"
            />
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-[#64748B] mr-1" />
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-[#1C2A3A] border-[#3A4D62] text-sm"
                placeholder="Due date (optional)"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              size="sm" 
              variant="outline"
              onClick={() => setShowAddForm(false)}
              className="border-[#3A4D62] text-[#F1F5F9]"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              size="sm" 
              disabled={isCreating || !newTaskTitle.trim()}
            >
              Add Task
            </Button>
          </div>
        </form>
      )}

      <ScrollArea className="max-h-[350px] pr-4" hideScrollbar={false}>
        {tasks.filter(task => !task.parent_task_id).length > 0 ? (
          <div className="space-y-2">
            {tasks
              .filter(task => !task.parent_task_id) // Only show top-level tasks in the main list
              .map(task => renderTask(task))}
          </div>
        ) : (
          <div className="text-center py-4 text-[#64748B] text-sm">
            No tasks yet. Click "Add Task" to create your first task.
          </div>
        )}
      </ScrollArea>

      {/* Task Detail Dialog */}
      {selectedTaskId && (
        <TaskDetailDialog 
          taskId={selectedTaskId} 
          missionId={missionId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
}

interface TaskDetailDialogProps {
  taskId: string;
  missionId: string;
  onClose: () => void;
}

function TaskDetailDialog({ taskId, missionId, onClose }: TaskDetailDialogProps) {
  const { 
    getTaskById, 
    updateTaskTitle, 
    updateTaskStatus, 
    updateTaskDueDate,
    getSubtasks,
    subtasks
  } = useMissionTasks(missionId);
  
  const task = getTaskById(taskId);
  
  const [title, setTitle] = useState(task?.title || '');
  const [status, setStatus] = useState(task?.status || 'open');
  const [dueDate, setDueDate] = useState(task?.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '');
  
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setStatus(task.status);
      setDueDate(task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '');
      getSubtasks(taskId);
    }
  }, [task, taskId, getSubtasks]);

  if (!task) {
    return null;
  }

  const handleSaveTitle = () => {
    if (title.trim() && title !== task.title) {
      updateTaskTitle(taskId, title);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (newStatus !== task.status) {
      updateTaskStatus(taskId, newStatus);
      setStatus(newStatus);
    }
  };

  const handleDueDateChange = (newDate: string) => {
    updateTaskDueDate(taskId, newDate);
    setDueDate(newDate);
  };

  return (
    <Dialog open={!!taskId} onOpenChange={() => onClose()}>
      <DialogContent className="bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9] max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-neon-aqua">Task Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#CBD5E1]">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveTitle}
              className="bg-[#25384D] border-[#3A4D62] text-[#F1F5F9]"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#CBD5E1]">Status</label>
            <div className="flex space-x-2">
              {['open', 'in-progress', 'completed'].map((statusOption) => (
                <Button
                  key={statusOption}
                  variant={status === statusOption ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusChange(statusOption)}
                  className={status === statusOption ? "" : "border-[#3A4D62] text-[#CBD5E1]"}
                >
                  {statusOption === 'open' && <Circle className="h-3 w-3 mr-1" />}
                  {statusOption === 'in-progress' && <Clock className="h-3 w-3 mr-1" />}
                  {statusOption === 'completed' && <Check className="h-3 w-3 mr-1" />}
                  {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#CBD5E1]">Due Date</label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => handleDueDateChange(e.target.value)}
              className="bg-[#25384D] border-[#3A4D62] text-[#F1F5F9]"
            />
          </div>
          
          {subtasks[taskId]?.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#CBD5E1]">Subtasks</label>
              <div className="space-y-1 ml-4">
                {subtasks[taskId].map((subtask) => (
                  <div key={subtask.id} className="flex items-center gap-2 p-2 rounded-md border border-[#3A4D62]/50 bg-[#25384D]/50">
                    <Checkbox
                      checked={subtask.status === 'completed'}
                      onCheckedChange={(checked) => {
                        const newStatus = checked ? 'completed' : 'open';
                        updateTaskStatus(subtask.id, newStatus);
                      }}
                    />
                    <span className={cn(
                      "text-sm",
                      subtask.status === 'completed' && "line-through text-[#64748B]"
                    )}>
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
