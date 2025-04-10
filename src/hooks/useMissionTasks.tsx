import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Task, SubTask } from '@/utils/types';

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
    refetch: recheckMission
  } = useQuery({
    queryKey: ['mission-exists', missionId, currentUserId],
    queryFn: async () => {
      if (!missionId || !currentUserId) return false;
      
      try {
        // Check if the missionId exists in the tasks table
        const { data, error } = await supabase
          .from('tasks')
          .select('id')
          .eq('id', missionId)
          .or(`reporter_id.eq.${currentUserId},user_id.eq.${currentUserId}`)
          .single();
          
        if (error) {
          console.error("Error checking mission existence:", error);
          
          // If not a direct mission ID, check if it's referenced in tags
          const { data: relatedTasks, error: relatedError } = await supabase
            .from('tasks')
            .select('id')
            .or(`reporter_id.eq.${currentUserId},user_id.eq.${currentUserId}`)
            .or(`tags.cs.{"mission:${missionId}"},id.eq.${missionId}`);
          
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
        
        // Get tasks associated with this mission - using OR condition to check both tag and direct ID match
        // This query has been improved to catch all related tasks and check both reporter_id and user_id
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .or(`reporter_id.eq.${currentUserId},user_id.eq.${currentUserId}`)
          .or(`tags.cs.{"${missionTag}"},id.eq.${missionId},parent_task_id.eq.${missionId}`)
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

  // Function to fetch all subtasks for a given parent task
  const fetchSubtasksForParent = useCallback(async (parentTaskId: string) => {
    if (!currentUserId) return [];
    
    try {
      // First try to fetch from the subtasks table
      const { data: subtasksData, error: subtasksError } = await supabase
        .from('subtasks')
        .select('*')
        .eq('parent_task_id', parentTaskId)
        .or(`user_id.eq.${currentUserId},created_by.eq.${currentUserId}`)
        .order('created_at', { ascending: true });
        
      if (!subtasksError && subtasksData && subtasksData.length > 0) {
        // If we found subtasks in the dedicated subtasks table
        console.log(`Found ${subtasksData.length} subtasks in subtasks table for parent: ${parentTaskId}`);
        
        // Map subtasks table entries to Task format for consistency in UI
        return subtasksData.map(subtask => ({
          id: subtask.id,
          title: subtask.title,
          description: null,
          status: subtask.is_completed ? 'completed' : 'open',
          priority: 'medium',
          due_date: null,
          assignee_id: null,
          reporter_id: subtask.created_by || currentUserId,
          user_id: subtask.user_id,
          parent_task_id: subtask.parent_task_id,
          created_at: subtask.created_at,
          updated_at: subtask.updated_at,
          tags: []
        }));
      }
      
      // If no results in subtasks table, try the tasks table
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('parent_task_id', parentTaskId)
        .or(`reporter_id.eq.${currentUserId},user_id.eq.${currentUserId}`)
        .order('created_at', { ascending: true });
        
      if (tasksError) {
        console.error(`Error fetching subtasks for ${parentTaskId}:`, tasksError);
        return [];
      }
      
      console.log(`Found ${tasksData?.length || 0} subtasks in tasks table for parent: ${parentTaskId}`);
      return tasksData as Task[];
    } catch (err) {
      console.error("Error fetching subtasks:", err);
      return [];
    }
  }, [currentUserId]);

  // Initial load of subtasks for all top-level tasks
  useEffect(() => {
    const loadAllSubtasks = async () => {
      if (tasks && tasks.length > 0 && currentUserId) {
        const topLevelTasks = tasks.filter(task => !task.parent_task_id || task.parent_task_id === null);
        
        // Create a new subtasks object
        const newSubtasks: Record<string, Task[]> = {};
        
        // Fetch subtasks for each top-level task
        for (const task of topLevelTasks) {
          const subtasksForTask = await fetchSubtasksForParent(task.id);
          newSubtasks[task.id] = subtasksForTask;
        }
        
        setSubtasks(newSubtasks);
      }
    };
    
    loadAllSubtasks();
  }, [tasks, currentUserId, fetchSubtasksForParent]);

  // Create a task helper function
  const createTaskMutation = useMutation({
    mutationFn: async (params: { 
      title: string; 
      parentTaskId: string | null; 
      description?: string | null;
    }) => {
      if (!currentUserId) throw new Error('User not authenticated');
      
      // Verify the mission exists before attempting to create a task
      if (!missionExists && !params.parentTaskId) {
        await recheckMission();
        if (!missionExists) {
          throw new Error('The referenced mission does not exist');
        }
      }
      
      const missionTag = missionId ? `mission:${missionId}` : null;
      
      // Determine if this is a subtask or a main task
      if (params.parentTaskId) {
        try {
          // Create in subtasks table
          const { data, error } = await supabase
            .from('subtasks')
            .insert({
              title: params.title,
              parent_task_id: params.parentTaskId,
              user_id: currentUserId,
              created_by: currentUserId,
              is_completed: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
            
          if (error) {
            console.error("Subtask creation error:", error);
            throw error;
          }
          return data;
        } catch (subtaskError) {
          console.error("Error creating subtask:", subtaskError);
          
          // Fallback to tasks table if subtasks table insertion fails
          console.log("Falling back to tasks table for subtask creation");
          const newTask = {
            title: params.title,
            description: params.description || null,
            status: 'open',
            priority: 'medium',
            reporter_id: currentUserId,
            user_id: currentUserId,
            parent_task_id: params.parentTaskId,
            due_date: dueDate,
            assignee_id: null,
            tags: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
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
        }
      } else {
        // Create a regular task
        const newTask = {
          title: params.title,
          description: params.description || null,
          status: 'open',
          priority: 'medium',
          reporter_id: currentUserId,
          user_id: currentUserId,
          parent_task_id: params.parentTaskId,
          due_date: dueDate,
          assignee_id: null,
          tags: missionTag ? [missionTag] : [],
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
      }
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
      
      // First try to update in subtasks table if it's a subtask
      try {
        const isCompletedValue = status === 'completed';
        const { data, error } = await supabase
          .from('subtasks')
          .update({ 
            is_completed: isCompletedValue,
            updated_at: new Date().toISOString()
          })
          .eq('id', taskId)
          .or(`user_id.eq.${currentUserId},created_by.eq.${currentUserId}`)
          .select()
          .single();
        
        if (!error && data) {
          return data;
        }
      } catch (subtaskError) {
        console.log("Task not found in subtasks table, trying tasks table");
      }
      
      // If not found in subtasks, try tasks table
      const { data, error } = await supabase
        .from('tasks')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .or(`reporter_id.eq.${currentUserId},user_id.eq.${currentUserId}`)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
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
        description: `Failed to update task status: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive"
      });
    }
  });

  const updateTaskTitle = useMutation({
    mutationFn: async ({ taskId, title }: { taskId: string, title: string }) => {
      if (!currentUserId) throw new Error('User not authenticated');
      
      // Try subtasks table first
      try {
        const { data, error } = await supabase
          .from('subtasks')
          .update({ 
            title,
            updated_at: new Date().toISOString()
          })
          .eq('id', taskId)
          .or(`user_id.eq.${currentUserId},created_by.eq.${currentUserId}`)
          .select()
          .single();
        
        if (!error && data) {
          return data;
        }
      } catch (subtaskError) {
        console.log("Task not found in subtasks table, trying tasks table");
      }
      
      // Try tasks table if not found in subtasks
      const { data, error } = await supabase
        .from('tasks')
        .update({ 
          title,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .or(`reporter_id.eq.${currentUserId},user_id.eq.${currentUserId}`)
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
      
      console.log(`Updating task ${taskId} with description:`, description);
      
      const { data, error } = await supabase
        .from('tasks')
        .update({ 
          description,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .or(`reporter_id.eq.${currentUserId},user_id.eq.${currentUserId}`)
        .select()
        .single();
        
      if (error) {
        console.error("Error updating description:", error);
        throw error;
      }
      
      console.log("Description updated successfully:", data);
      return data;
    },
    onSuccess: () => {
      // Invalidate the appropriate cache entries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['mission-tasks', missionId, currentUserId] });
      
      // Force an immediate refetch
      setTimeout(() => {
        refetch();
      }, 150);
      
      toast({
        title: "Description updated",
        description: "Task description has been saved"
      });
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
        .or(`reporter_id.eq.${currentUserId},user_id.eq.${currentUserId}`)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-tasks', missionId, currentUserId] });
      refetch();
      
      toast({
        title: "Date updated",
        description: "Task due date has been updated"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update due date: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive"
      });
    }
  });

  const updateTaskPriority = useMutation({
    mutationFn: async ({ taskId, priority }: { taskId: string, priority: string }) => {
      if (!currentUserId) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('tasks')
        .update({ 
          priority,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .or(`reporter_id.eq.${currentUserId},user_id.eq.${currentUserId}`)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-tasks', missionId, currentUserId] });
      refetch();
      
      toast({
        title: "Priority updated",
        description: "Task priority has been updated"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update priority: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive"
      });
    }
  });

  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      if (!currentUserId) throw new Error('User not authenticated');
      
      // Try to delete from subtasks table first
      try {
        const { error } = await supabase
          .from('subtasks')
          .delete()
          .eq('id', taskId)
          .or(`user_id.eq.${currentUserId},created_by.eq.${currentUserId}`);
        
        if (!error) {
          return { success: true };
        }
      } catch (subtaskError) {
        console.log("Task not found in subtasks table, trying tasks table");
      }
      
      // First, find and delete any subtasks that belong to this task in both tables
      try {
        // Delete from subtasks table
        await supabase
          .from('subtasks')
          .delete()
          .eq('parent_task_id', taskId);
          
        // Delete from tasks table where it's a subtask
        await supabase
          .from('tasks')
          .delete()
          .eq('parent_task_id', taskId);
      } catch (err) {
        console.error("Error deleting child tasks:", err);
      }
      
      // Then delete the task itself
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .or(`reporter_id.eq.${currentUserId},user_id.eq.${currentUserId}`);
        
      if (error) throw error;
      
      return { success: true };
    },
    onSuccess: (_, deletedTaskId) => {
      queryClient.invalidateQueries({ queryKey: ['mission-tasks', missionId, currentUserId] });
      refetch();
      
      // Clear any cached subtasks for the deleted task
      setSubtasks(prev => {
        const newSubtasks = { ...prev };
        delete newSubtasks[deletedTaskId];
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
      
      const subtasksForParent = await fetchSubtasksForParent(parentTaskId);
      return { parentTaskId, subtasks: subtasksForParent };
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
      createTaskMutation.mutate({ title, parentTaskId, description }),
    updateTaskStatus: (taskId: string, status: string) => 
      updateTaskStatus.mutate({ taskId, status }),
    updateTaskTitle: (taskId: string, title: string) => 
      updateTaskTitle.mutate({ taskId, title }),
    updateTaskDescription: (taskId: string, description: string | null) => 
      updateTaskDescription.mutate({ taskId, description }),
    updateTaskDueDate: (taskId: string, dueDate: string | null) =>
      updateTaskDueDate.mutate({ taskId, dueDate }),
    updateTaskPriority: (taskId: string, priority: string) =>
      updateTaskPriority.mutate({ taskId, priority }),
    deleteTask: (taskId: string) => deleteTask.mutate(taskId),
    getSubtasks: (parentTaskId: string) => getSubtasks.mutate(parentTaskId),
    getTaskById,
    refetch,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskStatus.isPending || updateTaskTitle.isPending || updateTaskDescription.isPending,
    isDeleting: deleteTask.isPending
  };
}
