
import React, { useEffect, useState } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Folder, FolderOpen } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';

interface ProjectSelectProps {
  onProjectSelect: (projectId: string) => void;
  className?: string;
}

export function ProjectSelect({ onProjectSelect, className = "" }: ProjectSelectProps) {
  const { projects, isLoadingProjects } = useProjects();
  const [selectedProject, setSelectedProject] = useState<string>('');
  
  const handleProjectChange = (value: string) => {
    setSelectedProject(value);
    onProjectSelect(value);
  };
  
  return (
    <Select value={selectedProject} onValueChange={handleProjectChange}>
      <SelectTrigger 
        className={`w-full border-neon-purple/30 hover:border-neon-purple/50 bg-slate-800/50 ${className}`}
      >
        <div className="flex items-center">
          {selectedProject ? <Folder className="h-4 w-4 mr-2 text-neon-purple/80" /> : <FolderOpen className="h-4 w-4 mr-2 text-neon-aqua/80" />}
          <SelectValue placeholder="Open Chats" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">
          <div className="flex items-center">
            <FolderOpen className="h-4 w-4 mr-2" />
            <span>Open Chats</span>
          </div>
        </SelectItem>
        
        {projects && projects.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            <div className="flex items-center">
              <Folder className="h-4 w-4 mr-2" />
              <span>{project.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
