
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Task, SubTask } from '@/utils/types';
import { taskApi } from '@/api';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export function useTasks(filters?: Record<string, any>) {
  const { toast } = useToast();
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  
  // Query for main tasks
  const { 
    data: tasks = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => taskApi.getTasks(),
  });
  
  // Query for subtasks of the active task
  const {
    data: subtasks = [],
    isLoading: isLoadingSubtasks,
    refetch: refetchSubtasks
  } = useQuery({
    queryKey: ['subtasks', activeTaskId],
    queryFn: () => activeTaskId ? taskApi.getSubtasks(activeTaskId) : Promise.resolve([]),
    enabled: !!activeTaskId, // Only run this query if there's an active task
  });
  
  const queryClient = useQueryClient();
  
  // Task mutations
  const createTaskMutation = useMutation({
    mutationFn: (data: Omit<Task, 'id'>) => taskApi.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Task created',
        description: 'Task has been created successfully'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create task: ${error.message}`,
        variant: 'destructive'
      });
    },
  });
  
  const updateTaskMutation = useMutation({
    mutationFn: (data: Task) => taskApi.updateTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Task updated',
        description: 'Task has been updated successfully'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update task: ${error.message}`,
        variant: 'destructive'
      });
    },
  });
  
  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => taskApi.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Task deleted',
        description: 'Task has been deleted successfully'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete task: ${error.message}`,
        variant: 'destructive'
      });
    },
  });
  
  // Subtask mutations
  const createSubtaskMutation = useMutation({
    mutationFn: (data: Omit<SubTask, 'id'>) => taskApi.createSubtask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', activeTaskId] });
      toast({
        title: 'Subtask added',
        description: 'Subtask has been added successfully'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to add subtask: ${error.message}`,
        variant: 'destructive'
      });
    },
  });
  
  const updateSubtaskMutation = useMutation({
    mutationFn: (data: SubTask) => taskApi.updateSubtask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', activeTaskId] });
      toast({
        title: 'Subtask updated',
        description: 'Subtask has been updated successfully'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update subtask: ${error.message}`,
        variant: 'destructive'
      });
    },
  });
  
  const deleteSubtaskMutation = useMutation({
    mutationFn: (id: string) => taskApi.deleteSubtask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', activeTaskId] });
      toast({
        title: 'Subtask deleted',
        description: 'Subtask has been deleted successfully'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete subtask: ${error.message}`,
        variant: 'destructive'
      });
    },
  });
  
  return {
    // Tasks data and state
    tasks,
    isLoading,
    error,
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
    
    // Subtasks data and state
    subtasks,
    isLoadingSubtasks,
    activeTaskId,
    setActiveTaskId,
    createSubtask: createSubtaskMutation.mutate,
    updateSubtask: updateSubtaskMutation.mutate, 
    deleteSubtask: deleteSubtaskMutation.mutate,
    isCreatingSubtask: createSubtaskMutation.isPending,
    isUpdatingSubtask: updateSubtaskMutation.isPending,
    isDeletingSubtask: deleteSubtaskMutation.isPending,
  };
}
