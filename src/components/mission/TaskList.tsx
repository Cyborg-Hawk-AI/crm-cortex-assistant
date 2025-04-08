
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Circle, Clock, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/utils/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TaskListProps {
  missionId: string;
}

export function TaskList({ missionId }: TaskListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to fetch tasks for the specific mission
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['mission-tasks', missionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('reporter_id', missionId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!missionId
  });

  // Add a new task
  const createTaskMutation = useMutation({
    mutationFn: async (title: string) => {
      const newTask = {
        title,
        status: 'open',
        priority: 'medium',
        reporter_id: missionId, // Using reporter_id field to store mission association
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('tasks')
        .insert(newTask)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setNewTaskTitle('');
      queryClient.invalidateQueries({ queryKey: ['mission-tasks', missionId] });
      toast({
        title: "Task created",
        description: "New task added to mission"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create task: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Update task status
  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string, status: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-tasks', missionId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update task: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Delete a task
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-tasks', missionId] });
      toast({
        title: "Task deleted",
        description: "Task removed from mission"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete task: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      createTaskMutation.mutate(newTaskTitle.trim());
    }
  };

  const toggleTaskStatus = (task: Task) => {
    const newStatus = task.status === 'completed' ? 'open' : 'completed';
    updateTaskStatusMutation.mutate({ taskId: task.id, status: newStatus });
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
      <h3 className="text-sm font-medium text-[#F1F5F9] mb-3">Mission Tasks</h3>
      
      <form onSubmit={handleCreateTask} className="flex gap-2 mb-4">
        <Input
          placeholder="Add a new task..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className="flex-1 bg-[#1C2A3A] border-[#3A4D62]"
        />
        <Button 
          type="submit" 
          size="sm" 
          disabled={createTaskMutation.isPending || !newTaskTitle.trim()}
          className="bg-neon-aqua/20 hover:bg-neon-aqua/30 text-neon-aqua"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </form>

      <ScrollArea className="max-h-[300px] pr-4" hideScrollbar={true}>
        {tasks.length > 0 ? (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div 
                key={task.id}
                className={cn(
                  "p-2 rounded flex items-center gap-3 group border",
                  task.status === 'completed' 
                    ? "bg-[#1C2A3A]/30 border-[#3A4D62]/30" 
                    : "bg-[#1C2A3A]/50 border-[#3A4D62]"
                )}
              >
                <button
                  onClick={() => toggleTaskStatus(task)}
                  className="flex-shrink-0"
                >
                  {getStatusIcon(task.status)}
                </button>
                <span className={cn(
                  "flex-1 text-sm",
                  task.status === 'completed' && "line-through text-[#64748B]"
                )}>
                  {task.title}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTaskMutation.mutate(task.id)}
                  className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 text-[#64748B] hover:text-red-400 hover:bg-red-400/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-[#64748B] text-sm">
            No tasks yet. Add your first task above.
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
