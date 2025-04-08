
import React, { useState, useRef, useEffect } from 'react';
import { Check, Circle, Clock, AlertCircle, Plus, Trash2, Calendar, ChevronRight, ChevronDown, Edit2, GripVertical } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { useMissionTasks } from '@/hooks/useMissionTasks';
import { Checkbox } from '@/components/ui/checkbox';
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
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const addTaskInputRef = useRef<HTMLInputElement>(null);

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

  // Focus on input when edit mode is activated
  useEffect(() => {
    if (editingTaskId && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [editingTaskId]);

  // Focus on add task input when shown
  useEffect(() => {
    if (showAddForm && addTaskInputRef.current) {
      addTaskInputRef.current.focus();
    }
  }, [showAddForm]);

  const handleCreateTask = async (e: React.FormEvent) => {
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
      await createTask(newTaskTitle.trim(), null, newTaskDescription);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setDueDate('');
      setShowAddForm(false);
      
      // Force a refetch to ensure tasks are up to date
      setTimeout(() => {
        refetch();
      }, 100);
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

  const handleCreateSubtask = async (parentTaskId: string) => {
    if (newTaskTitle.trim()) {
      await createTask(newTaskTitle.trim(), parentTaskId, newTaskDescription);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setDueDate('');
      
      // Force a refetch and update the subtasks
      setTimeout(() => {
        refetch();
        getSubtasks(parentTaskId);
      }, 100);
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
          
          <div className="flex-1 min-w-0">
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
                
                {task.due_date && (
                  <div className="mt-1 flex items-center text-xs text-[#64748B]">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{formatDueDate(task.due_date)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Subtasks */}
            {isExpanded && subtasks[task.id] && (
              <div className="mt-3 space-y-2">
                {subtasks[task.id].map(subtask => renderTask(subtask, true))}
                
                {/* Add subtask button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setNewTaskTitle('');
                    setShowAddForm(true);
                  }}
                  className="ml-6 h-7 text-xs text-[#64748B] hover:text-neon-aqua"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add subtask
                </Button>
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Are you sure you want to delete this task?')) {
                deleteTask(task.id);
              }
            }}
            className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 text-[#64748B] hover:text-neon-red hover:bg-neon-red/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        {isExpanded && showAddForm && (
          <div className="ml-6 mt-2 p-3 bg-[#1C2A3A]/70 rounded-md border border-[#3A4D62]">
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateSubtask(task.id);
            }}>
              <Input
                ref={addTaskInputRef}
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="New subtask title"
                className="mb-2 bg-[#25384D] border-[#3A4D62] text-[#F1F5F9]"
              />
              
              <Textarea
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Add description (optional)"
                className="mb-2 min-h-[60px] bg-[#25384D] border-[#3A4D62] text-[#F1F5F9] text-sm"
              />
              
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm" 
                  onClick={() => setShowAddForm(false)}
                  className="h-7 text-xs border-[#3A4D62] text-[#F1F5F9]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-7 text-xs"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <div className="h-3 w-3 rounded-full border-2 border-t-transparent border-neon-aqua animate-spin mr-1"></div>
                      Adding...
                    </>
                  ) : (
                    'Add Subtask'
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="h-6 w-6 rounded-full border-2 border-t-transparent border-neon-aqua animate-spin"></div>
      </div>
    );
  }

  if (!missionExists) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-[#CBD5E1]">The mission could not be found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-[#F1F5F9]">Tasks</h3>
        <Button
          onClick={() => {
            setNewTaskTitle('');
            setNewTaskDescription('');
            setShowAddForm(true);
          }}
          className="bg-neon-aqua/20 hover:bg-neon-aqua/30 text-neon-aqua hover:shadow-[0_0_8px_rgba(0,247,239,0.3)]"
          size="sm"
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Task
        </Button>
      </div>

      <ScrollArea className="pr-4 max-h-[calc(80vh-140px)]">
        <div className="space-y-2">
          {tasks.length === 0 && !showAddForm ? (
            <p className="text-center py-4 text-sm text-[#64748B]">
              No tasks yet. Add tasks to get started.
            </p>
          ) : (
            tasks.filter(task => !task.parent_task_id).map(task => renderTask(task))
          )}
          
          {/* Add Task Form */}
          {showAddForm && !editingTaskId && (
            <div className="p-3 bg-[#1C2A3A]/70 rounded-md border border-[#3A4D62]">
              <form onSubmit={handleCreateTask}>
                <Input
                  ref={addTaskInputRef}
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="New task title"
                  className="mb-2 bg-[#25384D] border-[#3A4D62] text-[#F1F5F9]"
                />
                
                <Textarea
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Add description (optional)"
                  className="mb-2 min-h-[80px] bg-[#25384D] border-[#3A4D62] text-[#F1F5F9] text-sm"
                />
                
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm" 
                    onClick={() => setShowAddForm(false)}
                    className="h-8 text-xs border-[#3A4D62] text-[#F1F5F9]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="h-8 text-xs"
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <>
                        <div className="h-3 w-3 rounded-full border-2 border-t-transparent border-neon-aqua animate-spin mr-1"></div>
                        Adding...
                      </>
                    ) : (
                      'Add Task'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
