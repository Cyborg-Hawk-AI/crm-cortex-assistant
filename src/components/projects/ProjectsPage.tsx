import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Grid3X3 } from 'lucide-react';
import { Project, Task } from '@/utils/types';
import { ProjectsTable } from '@/components/projects/ProjectsTable';
import { ProjectDetail } from '@/components/projects/ProjectDetail';
import { TaskDetail } from '@/components/projects/TaskDetail';
import { ProjectCreateButton } from '@/components/projects/ProjectCreateButton';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface ProjectsPageProps {
  selectedProjectId?: string | null;
  selectedTaskId?: string | null;
}

export function ProjectsPage({ selectedProjectId = null, selectedTaskId = null }: ProjectsPageProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [internalSelectedProjectId, setInternalSelectedProjectId] = useState<string | null>(selectedProjectId);
  const [internalSelectedTaskId, setInternalSelectedTaskId] = useState<string | null>(selectedTaskId);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(!!selectedTaskId);
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userId = await getCurrentUserId();
        setIsUserAuthenticated(!!userId);
        
        if (!userId) {
          toast({
            title: "Authentication Required",
            description: "Please sign in to view your projects",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsUserAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);
  
  useEffect(() => {
    if (selectedProjectId !== internalSelectedProjectId) {
      setInternalSelectedProjectId(selectedProjectId);
    }
    if (selectedTaskId !== internalSelectedTaskId) {
      setInternalSelectedTaskId(selectedTaskId);
      setIsTaskDetailOpen(!!selectedTaskId);
    }
  }, [selectedProjectId, selectedTaskId]);

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .is('parent_task_id', null)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching projects:', error);
          return [];
        }
        
        return (data || []).map(task => ({
          id: task.id || '',
          title: task.title || 'Untitled Project',
          description: task.description || '',
          status: task.status || 'open',
          owner_id: task.reporter_id || task.user_id || '',
          created_at: task.created_at || new Date().toISOString(),
          updated_at: task.updated_at || new Date().toISOString(),
          tags: task.tags || [],
          task_count: Math.floor(Math.random() * 10) + 1,
          completed_count: Math.floor(Math.random() * 5)
        })) as Project[];
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        return [];
      }
    },
    enabled: isUserAuthenticated === true
  });

  const { data: projectTasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['project-tasks', internalSelectedProjectId],
    queryFn: async () => {
      if (!internalSelectedProjectId) return [];
      
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('parent_task_id', internalSelectedProjectId)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching project tasks:', error);
          return [];
        }
        
        return data || [];
      } catch (err) {
        console.error('Failed to fetch project tasks:', err);
        return [];
      }
    },
    enabled: !!internalSelectedProjectId && isUserAuthenticated === true
  });
  
  const { data: selectedTask, isLoading: loadingTask } = useQuery({
    queryKey: ['task-detail', internalSelectedTaskId],
    queryFn: async () => {
      if (!internalSelectedTaskId) return null;
      
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', internalSelectedTaskId)
          .single();
          
        if (error) {
          console.error('Error fetching task details:', error);
          return null;
        }
        
        return data;
      } catch (err) {
        console.error('Failed to fetch task details:', err);
        return null;
      }
    },
    enabled: !!internalSelectedTaskId && isUserAuthenticated === true
  });

  const { data: subtasks = [], isLoading: loadingSubtasks } = useQuery({
    queryKey: ['subtasks', internalSelectedTaskId],
    queryFn: async () => {
      if (!internalSelectedTaskId) return [];
      
      try {
        const { data: subtasksData, error: subtasksError } = await supabase
          .from('subtasks')
          .select('*')
          .eq('parent_task_id', internalSelectedTaskId)
          .order('created_at', { ascending: true });
          
        if (!subtasksError && subtasksData && subtasksData.length > 0) {
          return subtasksData;
        }
        
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('parent_task_id', internalSelectedTaskId)
          .order('created_at', { ascending: true });
          
        if (tasksError) {
          console.error('Error fetching subtasks:', tasksError);
          return [];
        }
        
        if (tasksData && tasksData.length > 0) {
          return tasksData.map(task => ({
            id: task.id,
            title: task.title || 'Untitled Task',
            parent_task_id: task.parent_task_id,
            user_id: task.user_id,
            is_completed: task.status === 'completed' || task.status === 'resolved',
            created_by: task.reporter_id,
            created_at: task.created_at,
            updated_at: task.updated_at
          }));
        }
        
        return [];
      } catch (err) {
        console.error('Failed to fetch subtasks:', err);
        return [];
      }
    },
    enabled: !!internalSelectedTaskId && isUserAuthenticated === true && isTaskDetailOpen
  });

  const handleProjectClick = (projectId: string) => {
    setInternalSelectedProjectId(projectId);
    setInternalSelectedTaskId(null);
    setIsTaskDetailOpen(false);
    navigate(`/projects/${projectId}`);
  };

  const handleTaskClick = (taskId: string) => {
    setInternalSelectedTaskId(taskId);
    setIsTaskDetailOpen(true);
    
    if (internalSelectedProjectId) {
      navigate(`/projects/${internalSelectedProjectId}/tasks/${taskId}`);
    }
  };
  
  const handleBackToProjects = () => {
    setInternalSelectedProjectId(null);
    navigate('/projects');
  };
  
  const handleBackToProject = () => {
    setInternalSelectedTaskId(null);
    setIsTaskDetailOpen(false);
    
    if (internalSelectedProjectId) {
      navigate(`/projects/${internalSelectedProjectId}`);
    } else {
      navigate('/projects');
    }
  };
  
  const handleProjectCreated = (projectId: string) => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  };
  
  if (isUserAuthenticated === false) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Card className="w-full max-w-lg bg-[#25384D] border-[#3A4D62]">
          <CardContent className="pt-6 flex flex-col items-center">
            <div className="text-center">
              <Grid3X3 className="h-12 w-12 text-neon-aqua/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#F1F5F9] mb-2">Authentication Required</h3>
              <p className="text-sm text-[#CBD5E1] mb-6">
                Please sign in to view your projects and missions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingProjects || isUserAuthenticated === null) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="w-full max-w-lg p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-700/50 rounded-md w-1/3"></div>
            <div className="h-40 bg-gray-700/50 rounded-md"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!projects || projects.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Card className="w-full max-w-lg bg-[#25384D] border-[#3A4D62]">
          <CardContent className="pt-6 flex flex-col items-center">
            <div className="text-center">
              <Grid3X3 className="h-12 w-12 text-neon-aqua/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#F1F5F9] mb-2">Projects</h3>
              <p className="text-sm text-[#CBD5E1] mb-6">
                Create your first project to organize your tasks
              </p>
              <ProjectCreateButton 
                onProjectCreated={handleProjectCreated}
                navigateToProject={false} 
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedProjectExists = internalSelectedProjectId 
    ? projects.some(p => p.id === internalSelectedProjectId)
    : false;

  if (internalSelectedProjectId && !selectedProjectExists && !loadingProjects) {
    setTimeout(() => navigate('/projects'), 0);
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="w-full max-w-lg p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-700/50 rounded-md w-1/3"></div>
            <div className="h-40 bg-gray-700/50 rounded-md"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] overflow-y-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Grid3X3 className="mr-2 h-5 w-5 text-neon-aqua" />
          <h2 className="text-2xl font-bold text-[#F1F5F9]">Projects</h2>
        </div>
        
        {!internalSelectedProjectId && (
          <ProjectCreateButton 
            onProjectCreated={handleProjectCreated} 
            navigateToProject={false}
          />
        )}
      </div>

      {!internalSelectedProjectId ? (
        <ProjectsTable 
          projects={projects}
          onProjectClick={handleProjectClick}
          onCreateProject={() => setIsNewProjectDialogOpen(true)}
        />
      ) : (
        <ProjectDetail
          project={projects.find(p => p.id === internalSelectedProjectId) || {
            id: internalSelectedProjectId,
            title: 'Loading...',
            description: '',
            status: 'open',
            owner_id: '',
            created_at: '',
            updated_at: '',
            tags: [],
            task_count: 0,
            completed_count: 0
          }}
          tasks={projectTasks}
          onBack={handleBackToProjects}
          onTaskSelect={handleTaskClick}
        />
      )}
      
      {internalSelectedTaskId && selectedTask && (
        <Dialog open={isTaskDetailOpen} onOpenChange={(open) => {
          setIsTaskDetailOpen(open);
          if (!open) {
            handleBackToProject();
          }
        }}>
          <DialogContent className="sm:max-w-[700px] p-0 bg-[#25384D] border-[#3A4D62] max-h-[90vh] overflow-hidden">
            <TaskDetail
              task={selectedTask}
              subtasks={subtasks}
              onClose={handleBackToProject}
              onRefresh={() => {
                queryClient.invalidateQueries({ queryKey: ['task-detail', internalSelectedTaskId] });
                queryClient.invalidateQueries({ queryKey: ['subtasks', internalSelectedTaskId] });
                queryClient.invalidateQueries({ queryKey: ['project-tasks', internalSelectedProjectId] });
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
