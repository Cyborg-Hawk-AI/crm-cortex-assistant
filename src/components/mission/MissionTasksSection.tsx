
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TaskList } from '@/components/mission/TaskList';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProjectCreateButton } from '@/components/projects/ProjectCreateButton';

interface ProjectTasksSectionProps {
  projectId: string;
  compact?: boolean;
  showCreateButton?: boolean;
}

export function ProjectTasksSection({ 
  projectId, 
  compact = false,
  showCreateButton = false
}: ProjectTasksSectionProps) {
  if (!projectId) {
    return null;
  }
  
  if (compact) {
    return (
      <ScrollArea className="max-h-[400px]" hideScrollbar={true}>
        <TaskList projectId={projectId} />
      </ScrollArea>
    );
  }
  
  return (
    <Card className="bg-[#25384D] border-[#3A4D62] shadow-[0_0_15px_rgba(0,247,239,0.1)]">
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <CardTitle className="text-lg font-bold text-[#F1F5F9] flex items-center">
          <div className="w-2 h-2 rounded-full bg-neon-aqua mr-2"></div>
          Tasks
        </CardTitle>
        
        {showCreateButton && <ProjectCreateButton />}
      </CardHeader>
      <CardContent>
        <TaskList projectId={projectId} />
      </CardContent>
    </Card>
  );
}
