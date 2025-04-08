
import React, { useState, useEffect } from 'react';
import { useMissionTasks } from '@/hooks/useMissionTasks';
import { Plus, ChevronDown, ChevronUp, CheckCircle, Circle, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { RichTextEditor } from './RichTextEditor';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TaskListProps {
  missionId: string;
}

export function TaskList({ missionId }: TaskListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState<string>('');

  const {
    tasks,
    subtasks,
    isLoading,
    error,
    currentUserId,
    createTask,
    updateTaskTitle,
    updateTaskDescription,
    updateTaskStatus,
    deleteTask,
    getSubtasks,
    isCreating,
    isUpdating,
    isDeleting
  } = useMissionTasks(missionId);

  // Automatically expand tasks when first loaded
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const initialExpandState = tasks.reduce((acc, task) => {
        // Only auto-expand the first task
        acc[task.id] = task === tasks[0];
        return acc;
      }, {} as Record<string, boolean>);
      
      setExpandedTasks(initialExpandState);
    }
  }, [tasks]);

  const toggleTaskExpand = (taskId: string) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
    
    // Fetch subtasks if we're expanding
    if (!expandedTasks[taskId]) {
      getSubtasks(taskId);
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || isCreating) return;
    
    createTask(newTaskTitle.trim(), null);
    setNewTaskTitle('');
  };

  const handleToggleTaskStatus = (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'open' : 'completed';
    updateTaskStatus(taskId, newStatus);
  };

  const startEditingTask = (task: any) => {
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title);
  };

  const saveTaskTitle = (taskId: string) => {
    if (!editingTaskTitle.trim()) return;
    
    updateTaskTitle(taskId, editingTaskTitle.trim());
    setEditingTaskId(null);
  };

  const handleSubtaskCreate = (parentId: string, title: string) => {
    if (!title.trim()) return;
    createTask(title.trim(), parentId);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((index) => (
          <div key={index} className="p-3 border border-gray-200 rounded-md">
            <div className="flex items-start">
              <Skeleton className="h-5 w-5 mt-0.5 mr-2 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-red-500">Error loading tasks: {error.message}</p>
        <Button 
          variant="outline" 
          className="mt-2" 
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-amber-500">Please sign in to view and manage tasks</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreateTask} className="flex gap-2">
        <Input
          placeholder="Add new task..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className="flex-1"
        />
        <Button 
          type="submit" 
          disabled={!newTaskTitle.trim() || isCreating}
          className="bg-neon-aqua hover:bg-neon-aqua/90 text-black"
        >
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </form>

      {tasks.length === 0 ? (
        <div className="p-6 text-center border border-dashed rounded-md">
          <p className="text-sm text-muted-foreground">No tasks yet. Create your first task above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <Collapsible
              key={task.id}
              open={expandedTasks[task.id]}
              onOpenChange={() => toggleTaskExpand(task.id)}
              className="border border-gray-200 rounded-md overflow-hidden"
            >
              <div className="flex items-center p-3 bg-white">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`p-0 h-6 w-6 mr-2 ${task.status === 'completed' ? 'text-neon-green' : 'text-gray-400'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleTaskStatus(task.id, task.status);
                  }}
                >
                  {task.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </Button>

                {editingTaskId === task.id ? (
                  <div className="flex-1 flex items-center">
                    <Input
                      value={editingTaskTitle}
                      onChange={(e) => setEditingTaskTitle(e.target.value)}
                      className="flex-1"
                      autoFocus
                      onBlur={() => saveTaskTitle(task.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          saveTaskTitle(task.id);
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div 
                    className={cn(
                      "flex-1 cursor-pointer",
                      task.status === 'completed' && "line-through text-gray-500"
                    )}
                    onClick={() => toggleTaskExpand(task.id)}
                  >
                    <span className="font-medium">{task.title}</span>
                    {task.due_date && (
                      <span className="ml-2 text-xs text-gray-500">
                        Due: {format(new Date(task.due_date), 'MMM d')}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditingTask(task);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Are you sure you want to delete this task?')) {
                        deleteTask(task.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      {expandedTasks[task.id] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>

              <CollapsibleContent>
                <div className="p-3 border-t bg-gray-50">
                  <div className="mb-4">
                    <RichTextEditor
                      content={task.description}
                      onSave={(content) => updateTaskDescription(task.id, content)}
                      placeholder="Add description..."
                    />
                  </div>

                  {/* Subtasks */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Subtasks</h4>
                    
                    <TaskSubtaskList
                      parentTaskId={task.id}
                      existingSubtasks={subtasks[task.id] || []}
                      onToggleStatus={handleToggleTaskStatus}
                      onEdit={updateTaskTitle}
                      onDelete={deleteTask}
                      onCreateSubtask={handleSubtaskCreate}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  );
}

// Separate component for subtasks
interface TaskSubtaskListProps {
  parentTaskId: string;
  existingSubtasks: any[];
  onToggleStatus: (id: string, status: string) => void;
  onEdit: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onCreateSubtask: (parentId: string, title: string) => void;
}

function TaskSubtaskList({
  parentTaskId,
  existingSubtasks,
  onToggleStatus,
  onEdit,
  onDelete,
  onCreateSubtask
}: TaskSubtaskListProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleCreateSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    
    onCreateSubtask(parentTaskId, newSubtaskTitle);
    setNewSubtaskTitle('');
  };

  const startEditingSubtask = (subtask: any) => {
    setEditingId(subtask.id);
    setEditingTitle(subtask.title);
  };

  const saveSubtaskEdit = (id: string) => {
    if (!editingTitle.trim()) return;
    
    onEdit(id, editingTitle);
    setEditingId(null);
  };

  return (
    <div className="space-y-3">
      {existingSubtasks.length > 0 ? (
        existingSubtasks.map((subtask) => (
          <div
            key={subtask.id}
            className={cn(
              "flex items-center p-2 rounded-md",
              subtask.status === 'completed' ? 'bg-gray-100' : 'bg-white border border-gray-200'
            )}
          >
            <Button
              variant="ghost"
              size="sm"
              className={`p-0 h-5 w-5 mr-2 ${subtask.status === 'completed' ? 'text-neon-green' : 'text-gray-400'}`}
              onClick={() => onToggleStatus(subtask.id, subtask.status)}
            >
              {subtask.status === 'completed' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
            </Button>

            {editingId === subtask.id ? (
              <Input
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                className="flex-1 h-7 text-sm py-1"
                autoFocus
                onBlur={() => saveSubtaskEdit(subtask.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    saveSubtaskEdit(subtask.id);
                  }
                }}
              />
            ) : (
              <div 
                className={cn(
                  "flex-1 text-sm",
                  subtask.status === 'completed' && "line-through text-gray-500"
                )}
              >
                {subtask.title}
              </div>
            )}

            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => startEditingSubtask(subtask)}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-red-500"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this subtask?')) {
                    onDelete(subtask.id);
                  }
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center p-2 text-sm text-gray-500 italic">
          No subtasks yet
        </div>
      )}
      
      <form onSubmit={handleCreateSubtask} className="flex gap-2 mt-2">
        <Input
          placeholder="Add subtask..."
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          className="flex-1 h-8 text-sm"
        />
        <Button 
          type="submit" 
          size="sm"
          disabled={!newSubtaskTitle.trim()}
          className="h-8"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </form>
    </div>
  );
}
