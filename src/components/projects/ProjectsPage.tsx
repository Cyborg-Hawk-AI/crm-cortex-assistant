
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Grid3X3, Zap } from 'lucide-react';
import { Project, Task } from '@/utils/types';
import { ProjectsTable } from '@/components/projects/ProjectsTable';
import { ProjectDetail } from '@/components/projects/ProjectDetail';
import { TaskDetail } from '@/components/projects/TaskDetail';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function ProjectsPage() {
  const navigate = useNavigate();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  
  // Fetch projects from the database
  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        // Here we're treating top-level tasks as "projects" for now
        // In a real implementation, you'd have a dedicated projects table
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .is('parent_task_id', null)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching projects:', error);
          return [];
        }
        
        // Transform the data to match the Project interface
        return data.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status || 'open',
          owner_id: task.reporter_id || task.user_id,
          created_at: task.created_at,
          updated_at: task.updated_at,
          tags: task.tags || [],
          // These would normally come from a COUNT query in real implementation
          task_count: Math.floor(Math.random() * 10) + 1,
          completed_count: Math.floor(Math.random() * 5)
        })) as Project[];
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        return [];
      }
    }
  });

  // Fetch tasks for the selected project
  const { data: projectTasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['project-tasks', selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return [];
      
      try {
        // Fetch all tasks that have this project as their parent
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('parent_task_id', selectedProjectId)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching project tasks:', error);
          return [];
        }
        
        return data as Task[];
      } catch (err) {
        console.error('Failed to fetch project tasks:', err);
        return [];
      }
    },
    enabled: !!selectedProjectId
  });
  
  // Fetch single task details
  const { data: selectedTask, isLoading: loadingTask } = useQuery({
    queryKey: ['task-detail', selectedTaskId],
    queryFn: async () => {
      if (!selectedTaskId) return null;
      
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', selectedTaskId)
          .single();
          
        if (error) {
          console.error('Error fetching task details:', error);
          return null;
        }
        
        return data as Task;
      } catch (err) {
        console.error('Failed to fetch task details:', err);
        return null;
      }
    },
    enabled: !!selectedTaskId
  });

  // Fetch subtasks for the selected task
  const { data: subtasks = [], isLoading: loadingSubtasks } = useQuery({
    queryKey: ['subtasks', selectedTaskId],
    queryFn: async () => {
      if (!selectedTaskId) return [];
      
      try {
        // First try to get from subtasks table
        const { data: subtasksData, error: subtasksError } = await supabase
          .from('subtasks')
          .select('*')
          .eq('parent_task_id', selectedTaskId)
          .order('created_at', { ascending: true });
          
        if (!subtasksError && subtasksData && subtasksData.length > 0) {
          return subtasksData;
        }
        
        // If no subtasks in subtasks table, check tasks table
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('parent_task_id', selectedTaskId)
          .order('created_at', { ascending: true });
          
        if (tasksError) {
          console.error('Error fetching subtasks:', tasksError);
          return [];
        }
        
        // Convert tasks to subtasks format if needed
        if (tasksData && tasksData.length > 0) {
          return tasksData.map(task => ({
            id: task.id,
            title: task.title,
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
    enabled: !!selectedTaskId && isTaskDetailOpen
  });
  
  const handleProjectClick = (projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedTaskId(null);
    setIsTaskDetailOpen(false);
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsTaskDetailOpen(true);
  };
  
  const handleBackToProjects = () => {
    setSelectedProjectId(null);
  };
  
  const handleCreateProject = () => {
    setIsNewProjectDialogOpen(true);
  };
  
  if (loadingProjects) {
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
  
  if (!projects.length) {
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
              <Button
                onClick={handleCreateProject}
                className="bg-neon-aqua hover:bg-neon-aqua/90 text-black"
              >
                Create Project
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] overflow-y-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Grid3X3 className="mr-2 h-5 w-5 text-neon-aqua" />
          <h2 className="text-2xl font-bold text-[#F1F5F9]">Projects</h2>
        </div>
      </div>

      {!selectedProjectId ? (
        <ProjectsTable 
          projects={projects}
          onProjectClick={handleProjectClick}
          onCreateProject={handleCreateProject}
        />
      ) : (
        <ProjectDetail
          project={projects.find(p => p.id === selectedProjectId)!}
          tasks={projectTasks}
          onBack={handleBackToProjects}
          onTaskSelect={handleTaskClick}
        />
      )}
      
      {/* Task Detail Dialog */}
      {selectedTaskId && selectedTask && (
        <Dialog open={isTaskDetailOpen} onOpenChange={setIsTaskDetailOpen}>
          <DialogContent className="sm:max-w-[700px] p-0 bg-[#25384D] border-[#3A4D62] max-h-[90vh] overflow-hidden">
            <TaskDetail
              task={selectedTask}
              subtasks={subtasks}
              onClose={() => setIsTaskDetailOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
