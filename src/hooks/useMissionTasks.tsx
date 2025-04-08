
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/utils/types';

export function useMissionTasks(missionId: string | null) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: tasks = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['mission-tasks', missionId],
    queryFn: async () => {
      if (!missionId) return [];
      
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

  const createTask = useMutation({
    mutationFn: async (title: string) => {
      if (!missionId) throw new Error('No mission ID provided');
      
      const newTask = {
        title,
        status: 'open',
        priority: 'medium',
        reporter_id: missionId,
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

  const updateTaskStatus = useMutation({
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

  const deleteTask = useMutation({
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

  return {
    tasks,
    isLoading,
    error,
    newTaskTitle,
    setNewTaskTitle,
    createTask: (title: string) => createTask.mutate(title),
    updateTaskStatus: (taskId: string, status: string) => updateTaskStatus.mutate({ taskId, status }),
    deleteTask: (taskId: string) => deleteTask.mutate(taskId),
    isCreating: createTask.isPending,
    isUpdating: updateTaskStatus.isPending,
    isDeleting: deleteTask.isPending,
    refetch
  };
}
