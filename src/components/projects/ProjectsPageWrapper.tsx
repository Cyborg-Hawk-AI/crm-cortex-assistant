
import React from 'react';
import { useParams } from 'react-router-dom';
import { ProjectsPage } from '@/components/projects/ProjectsPage';
import { HomeButton } from '@/components/HomeButton';

export function ProjectsPageWrapper() {
  const { projectId, taskId } = useParams();
  
  return (
    <div className="h-[calc(100vh-120px)] overflow-y-auto">
      <HomeButton />
      <ProjectsPage 
        selectedProjectId={projectId || null}
        selectedTaskId={taskId || null}
      />
    </div>
  );
}
