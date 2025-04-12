
import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActionProject } from '@/utils/types';

interface ProjectDropdownProps {
  projects: ActionProject[];
  activeProjectId: string | null;
  onSelectProject: (projectId: string | null) => void;
  isLoading?: boolean;
}

export function ProjectDropdown({ 
  projects, 
  activeProjectId, 
  onSelectProject, 
  isLoading = false 
}: ProjectDropdownProps) {
  const activeProject = projects?.find(p => p.id === activeProjectId);
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between"
          disabled={isLoading}
        >
          <div className="flex items-center gap-2 truncate">
            <Folder className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">
              {activeProjectId ? activeProject?.name || 'Loading...' : 'Open Chats'}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <div className="max-h-[300px] overflow-auto">
          <Button
            variant="ghost"
            className="flex w-full items-center justify-between px-4 py-2 text-left"
            onClick={() => onSelectProject(null)}
          >
            <span>Open Chats</span>
            {activeProjectId === null && <Check className="h-4 w-4" />}
          </Button>
          {projects?.map((project) => (
            <Button
              key={project.id}
              variant="ghost"
              className="flex w-full items-center justify-between px-4 py-2 text-left"
              onClick={() => onSelectProject(project.id)}
            >
              <span className="truncate">{project.name}</span>
              {activeProjectId === project.id && <Check className="h-4 w-4" />}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
