
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectsPage } from '@/components/projects/ProjectsPage';
import { HomeButton } from '@/components/HomeButton';
import { useToast } from '@/hooks/use-toast';

export function ProjectsPageWrapper() {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simple loading state to prevent flashing
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [projectId, taskId]);
  
  // Handle any errors navigating to projects
  useEffect(() => {
    if (projectId && !loading) {
      // You could add validation here if needed
      console.log(`Loading project: ${projectId}${taskId ? ` with task: ${taskId}` : ''}`);
    }
  }, [projectId, taskId, loading]);
  
  return (
    <div className="h-[calc(100vh-120px)] overflow-y-auto">
      <HomeButton />
      {loading ? (
        <div className="h-full flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-700/50 rounded-md w-1/3"></div>
              <div className="h-40 bg-gray-700/50 rounded-md"></div>
            </div>
          </div>
        </div>
      ) : (
        <ProjectsPage 
          selectedProjectId={projectId || null}
          selectedTaskId={taskId || null}
        />
      )}
    </div>
  );
}
