
import React, { useState, useRef, useEffect } from 'react';
import { Check, Circle, Clock, AlertCircle, Plus, Trash2, Calendar, ChevronRight, ChevronDown, Edit2, GripVertical } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { useMissionTasks } from '@/hooks/useMissionTasks';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Task } from '@/utils/types';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ReactMarkdown from 'react-markdown';

interface TaskListProps {
  missionId: string;
}

export function TaskList({ missionId }: TaskListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [dueDate, setDueDate] = useState<string>('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  const [editingTaskDescription, setEditingTaskDescription] = useState('');
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);

  const {
    tasks,
    isLoading,
    missionExists,
    currentUserId,
    createTask,
    updateTaskStatus,
    updateTaskTitle,
    updateTaskDescription,
    deleteTask,
    isCreating,
    getSubtasks,
    subtasks,
    refetch
  } = useMissionTasks(missionId);

  // Ensure we load tasks when the mission ID changes
  useEffect(() => {
    if (missionId) {
      refetch();
    }
  }, [missionId, refetch]);

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
      createTask(newTaskTitle.trim(), null, newTaskDescription);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setDueDate('');
      setShowAddForm(false);
    }
  };

  const handleTaskTitleChange = (task: Task) => {
    if (editingTaskTitle.trim() && editingTaskTitle !== task.title) {
      updateTaskTitle(task.id, editingTaskTitle);
    }
    
    // Update description if it has changed
    if (editingTaskDescription !== task.description) {
      updateTaskDescription(task.id, editingTaskDescription);
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

  const toggleDescription = (taskId: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const handleCreateSubtask = (parentTaskId: string) => {
    if (newTaskTitle.trim()) {
      createTask(newTaskTitle.trim(), parentTaskId, newTaskDescription);
      setNewTaskTitle('');
      setNewTaskDescription('');
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

  const renderTaskEditor = (task: Task, isInlineEdit = true) => {
    return (
      <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
        <Input
          ref={titleInputRef}
          value={editingTaskTitle}
          onChange={(e) => setEditingTaskTitle(e.target.value)}
          className="mb-1 py-0 h-6 bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9]"
          placeholder="Task title"
        />
        <Textarea
          ref={descriptionInputRef}
          value={editingTaskDescription}
          onChange={(e) => setEditingTaskDescription(e.target.value)}
          placeholder="Add description or notes with Markdown support..."
          className="min-h-[120px] resize-none bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9] text-sm"
        />
        <div className="flex justify-between text-xs text-[#64748B]">
          <div>
            <span>Supports Markdown: **bold**, *italic*, - lists, etc.</span>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setEditingTaskId(null)}
            className="text-xs h-7 border-[#3A4D62] text-[#F1F5F9]"
          >
            Cancel
          </Button>
          <Button 
            size="sm" 
            onClick={() => handleTaskTitleChange(task)}
            className="text-xs h-7"
          >
            Save
          </Button>
        </div>
      </div>
    );
  };

  const renderTask = (task: Task, isSubtask = false) => {
    const hasSubtasks = subtasks[task.id]?.length > 0;
    const isExpanded = expandedTasks[task.id] || false;
    const isHovered = hoveredTaskId === task.id;
    const isDescriptionExpanded = expandedDescriptions[task.id] || false;
    
    return (
      <motion.div
        key={task.id}
        className="mb-2"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div 
          className={cn(
            "p-3 rounded-md flex items-start gap-3 group border transition-all duration-200",
            task.status === 'completed' 
              ? "bg-[#1C2A3A]/30 border-[#3A4D62]/30 text-[#64748B]" 
              : "bg-[#1C2A3A]/50 border-[#3A4D62] text-[#F1F5F9]",
            isSubtask && "ml-6",
            isHovered && "shadow-[0_0_8px_rgba(0,247,239,0.15)] border-neon-aqua/40"
          )}
          onMouseEnter={() => setHoveredTaskId(task.id)}
          onMouseLeave={() => setHoveredTaskId(null)}
        >
          <div className="flex items-center h-full mr-1 cursor-move text-[#64748B] opacity-0 group-hover:opacity-70 hover:opacity-100 transition-opacity">
            <GripVertical className="h-4 w-4" />
          </div>

          <div className="flex flex-col items-center gap-1">
            <Checkbox
              checked={task.status === 'completed'}
              onCheckedChange={(checked) => {
                const newStatus = checked ? 'completed' : 'open';
                updateTaskStatus(task.id, newStatus);
              }}
              className={cn(
                "mt-1 transition-all",
                task.status === 'completed' ? "text-neon-green" : ""
              )}
            />
            
            {hasSubtasks && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(task.id);
                }}
                className={cn(
                  "h-5 w-5 p-0 text-[#64748B] hover:text-neon-aqua transition-colors",
                  isExpanded && "text-neon-aqua"
                )}
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
              renderTaskEditor(task)
            ) : (
              <div>
                <div className="flex items-center gap-1 cursor-pointer">
                  <span 
                    className={cn(
                      "block text-sm transition-all",
                      task.status === 'completed' && "line-through"
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
                      setEditingTaskDescription(task.description || '');
                    }}
                    className="opacity-0 group-hover:opacity-100 h-5 w-5 p-0 text-[#64748B] hover:text-[#F1F5F9] transition-opacity"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
                
                {task.description && (
                  <Collapsible
                    open={isDescriptionExpanded}
                    onOpenChange={() => toggleDescription(task.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="mt-1 p-0 h-5 text-xs text-[#64748B] hover:text-neon-aqua transition-colors flex items-center gap-1"
                      >
                        {isDescriptionExpanded ? "Hide" : "Show"} notes
                        {isDescriptionExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 text-sm text-[#A3B8CC] bg-[#1A2433] p-2 rounded border border-[#3A4D62]/50">
                      <div className="prose prose-sm prose-invert max-w-none">
                        <ReactMarkdown>
                          {task.description}
                        </ReactMarkdown>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
                
                <div className="flex items-center flex-wrap gap-2 mt-1">
                  {task.due_date && (
                    <span className="text-xs text-[#64748B] flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDueDate(task.due_date)}
                    </span>
                  )}
                  
                  {subtasks[task.id]?.length > 0 && (
                    <span className="text-xs text-[#64748B]">
                      {subtasks[task.id].length} subtask{subtasks[task.id].length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                
                {!hasSubtasks && !isSubtask && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewTaskTitle('');
                      setNewTaskDescription('');
                      toggleExpand(task.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 mt-1 h-5 text-xs text-[#64748B] hover:text-neon-aqua p-0 transition-opacity"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add subtask
                  </Button>
                )}
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              deleteTask(task.id);
            }}
            className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 text-[#64748B] hover:text-red-400 hover:bg-red-400/10 transition-all"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Subtasks section */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {subtasks[task.id]?.map((subtask) => renderTask(subtask, true))}
              
              {/* Add subtask form */}
              <div className="ml-6 mt-2 mb-3 bg-[#1C2A3A]/30 p-3 rounded-md border border-[#3A4D62]/50 hover:border-neon-aqua/30 transition-colors">
                <Input
                  placeholder="Add subtask..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="mb-2 bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9]"
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  className="mb-2 bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9] min-h-[60px] resize-none text-sm"
                />
                <div className="flex justify-end gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setNewTaskTitle('');
                      setNewTaskDescription('');
                    }}
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
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
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
          className="bg-neon-aqua/20 hover:bg-neon-aqua/30 text-neon-aqua hover:shadow-[0_0_8px_rgba(0,247,239,0.3)]"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Task
        </Button>
      </div>
      
      <AnimatePresence>
        {showAddForm && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleCreateTask} 
            className="mb-4 bg-[#1C2A3A]/50 p-3 rounded-md border border-[#3A4D62] hover:border-neon-aqua/30 transition-colors"
          >
            <div className="mb-2">
              <Input
                placeholder="Task title..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="mb-2 bg-[#1C2A3A] border-[#3A4D62]"
              />
              <Textarea
                placeholder="Task notes and details with Markdown support"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                className="mb-2 bg-[#1C2A3A] border-[#3A4D62] min-h-[120px] resize-none text-sm"
              />
              <div className="flex items-center mb-2">
                <Calendar className="h-4 w-4 text-[#64748B] mr-1" />
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-[#1C2A3A] border-[#3A4D62] text-sm"
                  placeholder="Due date (optional)"
                />
              </div>
              <div className="text-xs text-[#64748B]">
                <span>Supports Markdown: **bold**, *italic*, - lists, etc.</span>
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
                className="hover:shadow-[0_0_8px_rgba(0,247,239,0.3)]"
              >
                Add Task
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <ScrollArea className="max-h-[350px] pr-4" hideScrollbar={false}>
        {tasks.filter(task => !task.parent_task_id).length > 0 ? (
          <div className="space-y-2">
            {tasks
              .filter(task => !task.parent_task_id) // Only show top-level tasks in the main list
              .map(task => renderTask(task))}
          </div>
        ) : (
          <div className="text-center py-8 text-[#64748B] text-sm">
            <div className="mx-auto mb-2 p-2 rounded-full bg-[#1C2A3A] w-10 h-10 flex items-center justify-center">
              <Plus className="h-5 w-5 text-neon-aqua" />
            </div>
            <p>No tasks yet</p>
            <p className="text-xs mt-1 max-w-[200px] mx-auto">Click "Add Task" to create your first task for this mission</p>
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
    updateTaskDescription,
    updateTaskStatus, 
    updateTaskDueDate,
    getSubtasks,
    subtasks
  } = useMissionTasks(missionId);
  
  const task = getTaskById(taskId);
  
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState(task?.status || 'open');
  const [dueDate, setDueDate] = useState(task?.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '');
  
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
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
  
  const handleSaveDescription = () => {
    if (description !== task.description) {
      updateTaskDescription(taskId, description);
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
      <DialogContent className="bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9] max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-neon-aqua">Task Details</DialogTitle>
          <DialogDescription className="text-[#CBD5E1]">
            Edit task information and view subtasks
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#CBD5E1]">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveTitle}
              className="bg-[#25384D] border-[#3A4D62] text-[#F1F5F9] hover:border-neon-aqua/30 focus:border-neon-aqua/50 transition-colors"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#CBD5E1]">Notes</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleSaveDescription}
              placeholder="Add notes with Markdown support..."
              className="min-h-[200px] bg-[#25384D] border-[#3A4D62] text-[#F1F5F9] hover:border-neon-aqua/30 focus:border-neon-aqua/50 transition-colors"
            />
            <div className="text-xs text-[#64748B]">
              <span>Supports Markdown: **bold**, *italic*, - lists, etc.</span>
            </div>
            
            {description && (
              <div className="mt-4 p-3 bg-[#25384D]/50 border border-[#3A4D62] rounded-md">
                <h4 className="text-sm font-medium text-neon-aqua mb-2">Preview</h4>
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>
                    {description}
                  </ReactMarkdown>
                </div>
              </div>
            )}
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
                  className={cn(
                    status === statusOption 
                      ? "hover:shadow-[0_0_8px_rgba(0,247,239,0.3)]" 
                      : "border-[#3A4D62] text-[#CBD5E1]"
                  )}
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
              className="bg-[#25384D] border-[#3A4D62] text-[#F1F5F9] hover:border-neon-aqua/30 focus:border-neon-aqua/50 transition-colors"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
