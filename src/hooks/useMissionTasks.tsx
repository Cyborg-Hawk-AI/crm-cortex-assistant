import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/utils/types';

export function useMissionTasks(missionId: string | null) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [subtasks, setSubtasks] = useState<Record<string, Task[]>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user ID for task creation and filtering
  const {
    data: currentUserId,
    isLoading: loadingUserId
  } = useQuery({
    queryKey: ['current-user-id'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session?.user.id || null;
    }
  });

  // Validate the missionId exists and belongs to the current user
  const {
    data: missionExists,
    isLoading: checkingMission,
  } = useQuery({
    queryKey: ['mission-exists', missionId],
    queryFn: async () => {
      if (!missionId || !currentUserId) return false;
      
      try {
        // Check if the missionId exists in the tasks table
        const { data, error } = await supabase
          .from('tasks')
          .select('id')
          .eq('id', missionId)
          .eq('reporter_id', currentUserId) // Use reporter_id instead of user_id
          .single();
          
        if (error) {
          console.error("Error checking mission existence:", error);
          
          // If not a direct mission ID, check if it's referenced in tags
          const { data: relatedTasks, error: relatedError } = await supabase
            .from('tasks')
            .select('id')
            .eq('reporter_id', currentUserId) // Use reporter_id instead of user_id
            .filter('tags', 'cs', `{"mission:${missionId}"}`);
          
          if (relatedError || !relatedTasks || relatedTasks.length === 0) {
            return false;
          }
          
          return true;
        }
        
        return !!data;
      } catch (err) {
        console.error("Error in mission validation:", err);
        return false;
      }
    },
    enabled: !!missionId && !!currentUserId
  });

  const {
    data: tasks = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['mission-tasks', missionId, currentUserId],
    queryFn: async () => {
      if (!missionId || !currentUserId) return [];
      
      try {
        // Format the tag properly for Postgres containment operator
        const missionTag = `mission:${missionId}`;
        
        // Get tasks associated with this mission
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('reporter_id', currentUserId) // Use reporter_id instead of user_id
          .contains('tags', [missionTag])
          .order('created_at', { ascending: true });
          
        if (error) {
          console.error("Error fetching tasks:", error);
          throw error;
        }
        
        console.log("Fetched tasks for mission", missionId, ":", data);
        return data as Task[];
      } catch (err) {
        console.error("Error in task retrieval:", err);
        return [];
      }
    },
    enabled: !!missionId && !!currentUserId && missionExists !== false,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Initial load of subtasks for all top-level tasks
  useEffect(() => {
    if (tasks && tasks.length > 0 && currentUserId) {
      const topLevelTasks = tasks.filter(task => !task.parent_task_id);
      
      // Batch load subtasks for top-level tasks
      topLevelTasks.forEach(task => {
        getSubtasks.mutate(task.id);
      });
    }
  }, [tasks, currentUserId]);

  const createTask = useMutation({
    mutationFn: async (params: { 
      title: string; 
      parentTaskId: string | null; 
      description?: string | null;
    }) => {
      if (!missionId) throw new Error('No mission ID provided');
      if (!currentUserId) throw new Error('User not authenticated');
      
      // Verify the mission exists before attempting to create a task
      if (!missionExists && !params.parentTaskId) {
        throw new Error('The referenced mission does not exist');
      }
      
      const missionTag = `mission:${missionId}`;
      
      const newTask = {
        title: params.title,
        description: params.description || null,
        status: 'open',
        priority: 'medium',
        reporter_id: currentUserId,
        parent_task_id: params.parentTaskId,
        due_date: dueDate,
        assignee_id: null,
        // Store mission ID in tags array to query related tasks
        tags: params.parentTaskId ? [] : [missionTag],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      console.log("Creating task with data:", newTask);
      
      const { data, error } = await supabase
        .from('tasks')
        .insert(newTask)
        .select()
        .single();
        
      if (error) {
        console.error("Task creation error:", error);
        throw error;
      }
      return data;
    },
    onSuccess: (data, variables) => {
      setNewTaskTitle('');
      setDueDate(null);
      
      // Invalidate and refetch the mission tasks query
      queryClient.invalidateQueries({ queryKey: ['mission-tasks', missionId, currentUserId] });
      
      // Force an immediate refetch to update the UI
      setTimeout(() => {
        refetch();
      }, 100);
      
      if (variables.parentTaskId) {
        getSubtasks.mutate(variables.parentTaskId);
      }
      
      toast({
        title: "Task created",
        description: "New task added to mission"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create task: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive"
      });
    }
  });

  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string, status: string }) => {
      if (!currentUserId) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('tasks')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .eq('reporter_id', currentUserId) // Using reporter_id instead of user_id
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mission-tasks', missionId, currentUserId] });
      refetch();
      
      // If this is a subtask, we need to invalidate the parent's subtasks
      if (data.parent_task_id) {
        getSubtasks.mutate(data.parent_task_id);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update task: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive"
      });
    }
  });

  const updateTaskTitle = useMutation({
    mutationFn: async ({ taskId, title }: { taskId: string, title: string }) => {
      if (!currentUserId) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('tasks')
        .update({ 
          title,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .eq('reporter_id', currentUserId) // Using reporter_id instead of user_id
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-tasks', missionId, currentUserId] });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update task title: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive"
      });
    }
  });

  const updateTaskDescription = useMutation({
    mutationFn: async ({ taskId, description }: { taskId: string, description: string | null }) => {
      if (!currentUserId) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('tasks')
        .update({ 
          description,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .eq('reporter_id', currentUserId) // Using reporter_id instead of user_id
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-tasks', missionId, currentUserId] });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update task description: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive"
      });
    }
  });

  const updateTaskDueDate = useMutation({
    mutationFn: async ({ taskId, dueDate }: { taskId: string, dueDate: string | null }) => {
      if (!currentUserId) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('tasks')
        .update({ 
          due_date: dueDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .eq('reporter_id', currentUserId) // Using reporter_id instead of user_id
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-tasks', missionId, currentUserId] });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update due date: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive"
      });
    }
  });

  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      if (!currentUserId) throw new Error('User not authenticated');
      
      // First, find and delete any subtasks that belong to this task
      const { data: subtasksToDelete } = await supabase
        .from('tasks')
        .select('id')
        .eq('parent_task_id', taskId)
        .eq('reporter_id', currentUserId); // Using reporter_id instead of user_id
      
      if (subtasksToDelete && subtasksToDelete.length > 0) {
        const subtaskIds = subtasksToDelete.map(subtask => subtask.id);
        await supabase
          .from('tasks')
          .delete()
          .in('id', subtaskIds)
          .eq('reporter_id', currentUserId); // Using reporter_id instead of user_id
      }
      
      // Then delete the task itself
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('reporter_id', currentUserId); // Using reporter_id instead of user_id
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-tasks', missionId, currentUserId] });
      refetch();
      
      // Clear any cached subtasks for the deleted task
      setSubtasks(prev => {
        const newSubtasks = { ...prev };
        delete newSubtasks[missionId as string];
        return newSubtasks;
      });
      
      toast({
        title: "Task deleted",
        description: "Task removed from mission"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete task: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive"
      });
    }
  });

  const getSubtasks = useMutation({
    mutationFn: async (parentTaskId: string) => {
      if (!currentUserId) throw new Error('User not authenticated');
      
      console.log(`Fetching subtasks for parent: ${parentTaskId}`);
      const { data, error } = await supabase
        .from('tasks') // Using tasks table for subtasks as per schema
        .select('*')
        .eq('parent_task_id', parentTaskId)
        .eq('reporter_id', currentUserId) // Using reporter_id instead of user_id
        .order('created_at', { ascending: true });
        
      if (error) {
        console.error(`Error fetching subtasks for ${parentTaskId}:`, error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} subtasks for parent: ${parentTaskId}`);
      return { parentTaskId, subtasks: data as Task[] };
    },
    onSuccess: (result) => {
      setSubtasks(prev => ({
        ...prev,
        [result.parentTaskId]: result.subtasks
      }));
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to fetch subtasks: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive"
      });
    }
  });

  const getTaskById = (taskId: string) => {
    return tasks.find(task => task.id === taskId);
  };

  return {
    tasks,
    subtasks,
    isLoading: isLoading || checkingMission || loadingUserId,
    error,
    newTaskTitle,
    setNewTaskTitle,
    dueDate,
    setDueDate,
    missionExists,
    currentUserId,
    createTask: (title: string, parentTaskId: string | null, description?: string) => 
      createTask.mutate({ title, parentTaskId, description }),
    updateTaskStatus: (taskId: string, status: string) => 
      updateTaskStatus.mutate({ taskId, status }),
    updateTaskTitle: (taskId: string, title: string) => 
      updateTaskTitle.mutate({ taskId, title }),
    updateTaskDescription: (taskId: string, description: string | null) => 
      updateTaskDescription.mutate({ taskId, description }),
    updateTaskDueDate: (taskId: string, dueDate: string | null) => 
      updateTaskDueDate.mutate({ taskId, dueDate }),
    deleteTask: (taskId: string) => deleteTask.mutate(taskId),
    getSubtasks: (parentTaskId: string) => getSubtasks.mutate(parentTaskId),
    getTaskById,
    isCreating: createTask.isPending,
    isUpdating: updateTaskStatus.isPending || updateTaskTitle.isPending || updateTaskDueDate.isPending,
    isDeleting: deleteTask.isPending,
    refetch
  };
}
