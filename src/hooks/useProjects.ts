import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as projectsApi from '@/api/projects';
import { ActionProject } from '@/utils/types';
import { useToast } from './use-toast';
import { getCurrentUserId } from '@/lib/supabase';
import { assignConversationToProject } from '@/api/messages';

export function useProjects() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [userAuthenticated, setUserAuthenticated] = useState<boolean | null>(null);
  
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
  
  const { 
    data: projects = [],
    isLoading: isLoadingProjects,
    error: projectsError,
    refetch: refetchProjects
  } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getProjects,
    enabled: userAuthenticated === true,
    retry: 2,
    meta: {
      onError: (error: any) => {
        console.warn('Projects fetch error:', error);
      }
    }
  });

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

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => projectsApi.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setActiveProjectId(null);
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

  const { 
    data: activeProjectConversations = [],
    isLoading: isLoadingActiveProjectConversations,
    error: activeProjectError
  } = useQuery({
    queryKey: ['activeProject', activeProjectId],
    queryFn: () => activeProjectId ? projectsApi.getConversationsByProject(activeProjectId) : [],
    enabled: !!activeProjectId && userAuthenticated === true,
    retry: 2,
    meta: {
      onError: (error: any) => {
        console.warn('Project conversations fetch error:', error);
      }
    }
  });

  const createProject = (name: string, description?: string) => {
    return createProjectMutation.mutate({ name, description });
  };

  const updateProject = (id: string, updates: { name?: string; description?: string }) => {
    return updateProjectMutation.mutate({ id, updates });
  };

  const deleteProject = (id: string) => {
    return deleteProjectMutation.mutate(id);
  };

  const moveConversationToProject = async (conversationId: string, projectId: string) => {
    console.log(`useProjects: Moving conversation ${conversationId} to project ${projectId || 'Open Chats'}`);
    return assignConversationMutation.mutate({ conversationId, projectId });
  };

  const assignConversationMutation = useMutation({
    mutationFn: ({ conversationId, projectId }: { conversationId: string; projectId: string }) => 
      assignConversationToProject(conversationId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['activeProject'] });
      toast({
        title: "Conversation moved",
        description: "The conversation has been moved to another project",
      });
    },
    onError: (error: Error) => {
      console.error("Error in assignConversationMutation:", error);
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
