
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectsPage } from '@/components/projects/ProjectsPage';
import { HomeButton } from '@/components/HomeButton';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

export function ProjectsPageWrapper() {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [projectExists, setProjectExists] = useState<boolean | null>(null);
  
  // Check if the project exists
  useEffect(() => {
    const checkProject = async () => {
      if (!projectId) {
        setProjectExists(null);
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('id, title, status')
          .eq('id', projectId)
          .is('parent_task_id', null)
          .maybeSingle(); // Using maybeSingle instead of single to avoid errors
          
        if (error) {
          console.error("Error checking project existence:", error);
          setProjectExists(false);
        } else {
          console.log("Project data found:", data);
          setProjectExists(!!data);
        }
      } catch (err) {
        console.error("Error in project validation:", err);
        setProjectExists(false);
      } finally {
        setLoading(false);
      }
    };
    
    setLoading(true);
    checkProject();
  }, [projectId]);
  
  // Redirect if project doesn't exist
  useEffect(() => {
    if (projectExists === false && !loading) {
      toast({
        title: "Project not found",
        description: "The project you're looking for doesn't exist or you don't have access to it.",
        variant: "destructive"
      });
      navigate("/projects");
    }
  }, [projectExists, loading, navigate, toast]);
  
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
