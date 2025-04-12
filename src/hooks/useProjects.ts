
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as projectsApi from '@/api/projects';
import { ActionProject } from '@/utils/types';
import { useToast } from './use-toast';
import { getCurrentUserId } from '@/lib/supabase';

export function useProjects() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [userAuthenticated, setUserAuthenticated] = useState<boolean | null>(null);
  
  // Check if user is authenticated before fetching data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userId = await getCurrentUserId();
        setUserAuthenticated(!!userId);
      } catch (err) {
        console.error('Auth check failed:', err);
        setUserAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Fetch projects
  const { 
    data: projects = [],
    isLoading: isLoadingProjects,
    error: projectsError,
    refetch: refetchProjects
  } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getProjects,
    // Only run query if user is authenticated
    enabled: userAuthenticated === true,
    retry: 2,
    staleTime: 1000 * 60 * 2, // 2 minutes - reduced from 5 to ensure fresher data
    meta: {
      onError: (error: any) => {
        console.warn('Projects fetch error:', error);
      }
    }
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: ({ name, description }: { name: string; description?: string }) => 
      projectsApi.createProject(name, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Project created",
        description: "Your new project has been created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating project",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: { name?: string; description?: string } }) => 
      projectsApi.updateProject(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Project updated",
        description: "Your project has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating project",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => projectsApi.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setActiveProjectId(null); // Reset active project if it was deleted
      toast({
        title: "Project deleted",
        description: "The project and its conversations have been updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting project",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Fetch conversations for active project
  const { 
    data: activeProjectConversations = [],
    isLoading: isLoadingActiveProjectConversations,
    error: activeProjectError,
    refetch: refetchActiveProjectConversations
  } = useQuery({
    queryKey: ['activeProject', activeProjectId],
    queryFn: () => activeProjectId ? projectsApi.getConversationsByProject(activeProjectId) : [],
    enabled: !!activeProjectId && userAuthenticated === true,
    retry: 2,
    staleTime: 1000 * 60 * 1, // 1 minute - reduced to ensure fresher data
    meta: {
      onError: (error: any) => {
        console.warn('Project conversations fetch error:', error);
      }
    }
  });

  // Create a new project
  const createProject = (name: string, description?: string) => {
    return createProjectMutation.mutate({ name, description });
  };

  // Update a project
  const updateProject = (id: string, updates: { name?: string; description?: string }) => {
    return updateProjectMutation.mutate({ id, updates });
  };

  // Delete a project
  const deleteProject = (id: string) => {
    return deleteProjectMutation.mutate(id);
  };

  // Move a conversation to another project
  const moveConversationToProject = (conversationId: string, projectId: string) => {
    return assignConversationMutation.mutate({ conversationId, projectId });
  };

  // Assign conversation to project mutation
  const assignConversationMutation = useMutation({
    mutationFn: ({ conversationId, projectId }: { conversationId: string; projectId: string }) => 
      projectsApi.assignConversationToProject(conversationId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['activeProject'] });
      toast({
        title: "Conversation moved",
        description: "The conversation has been moved to another project",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error moving conversation",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    projects,
    isLoadingProjects,
    projectsError,
    refetchProjects,
    activeProjectId,
    setActiveProjectId,
    activeProjectConversations,
    isLoadingActiveProjectConversations,
    activeProjectError,
    refetchActiveProjectConversations,
    createProject,
    updateProject,
    deleteProject,
    moveConversationToProject,
    isCreatingProject: createProjectMutation.isPending,
    isUpdatingProject: updateProjectMutation.isPending,
    isDeletingProject: deleteProjectMutation.isPending,
    isMovingConversation: assignConversationMutation.isPending,
    userAuthenticated
  };
}
