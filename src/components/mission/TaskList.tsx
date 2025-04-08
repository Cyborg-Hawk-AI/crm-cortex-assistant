
import React, { useState } from 'react';
import { Check, Circle, Clock, AlertCircle, Plus, Trash2, Calendar } from 'lucide-react';
import { cn } from "@/lib/utils";
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/utils/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { useMissionTasks } from '@/hooks/useMissionTasks';

interface TaskListProps {
  missionId: string;
}

export function TaskList({ missionId }: TaskListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [dueDate, setDueDate] = useState<string>('');
  const { toast } = useToast();
  
  const {
    tasks,
    isLoading,
    createTask,
    updateTaskStatus,
    deleteTask,
    isCreating
  } = useMissionTasks(missionId);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      createTask(newTaskTitle.trim());
      setNewTaskTitle('');
      setDueDate('');
      setShowAddForm(false);
    }
  };

  const toggleTaskStatus = (task: Task) => {
    const newStatus = task.status === 'completed' ? 'open' : 'completed';
    updateTaskStatus(task.id, newStatus);
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed':
        return <Check className="h-5 w-5 text-emerald-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'blocked':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-slate-400" />;
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

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="h-6 bg-[#3A4D62]/30 rounded animate-pulse mb-3"></div>
        <div className="h-6 bg-[#3A4D62]/30 rounded animate-pulse mb-3"></div>
        <div className="h-6 bg-[#3A4D62]/30 rounded animate-pulse"></div>
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
        {tasks.length > 0 ? (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div 
                key={task.id}
                className={cn(
                  "p-3 rounded flex items-start gap-3 group border",
                  task.status === 'completed' 
                    ? "bg-[#1C2A3A]/30 border-[#3A4D62]/30" 
                    : "bg-[#1C2A3A]/50 border-[#3A4D62]"
                )}
              >
                <button
                  onClick={() => toggleTaskStatus(task)}
                  className="flex-shrink-0 mt-0.5"
                >
                  {getStatusIcon(task.status)}
                </button>
                <div className="flex-1 min-w-0">
                  <span className={cn(
                    "block text-sm",
                    task.status === 'completed' && "line-through text-[#64748B]"
                  )}>
                    {task.title}
                  </span>
                  {task.due_date && (
                    <span className="text-xs text-[#64748B] flex items-center mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDueDate(task.due_date)}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 text-[#64748B] hover:text-red-400 hover:bg-red-400/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-[#64748B] text-sm">
            No tasks yet. Click "Add Task" to create your first task.
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
