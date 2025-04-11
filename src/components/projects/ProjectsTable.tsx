
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Project } from '@/utils/types';
import { formatDateRelative } from '@/lib/utils';
import { Grid3X3, Plus, ArrowRight } from 'lucide-react';

interface ProjectsTableProps {
  projects: Project[];
  onProjectClick: (id: string) => void;
  onCreateProject?: () => void;
}

export function ProjectsTable({ projects, onProjectClick, onCreateProject }: ProjectsTableProps) {
  // Safe status color handling to prevent undefined errors
  const getStatusColor = (status: string | null | undefined) => {
    if (!status) return 'bg-gray-200/20 text-gray-500';
    
    const normalizedStatus = status.toLowerCase();
    
    switch (normalizedStatus) {
      case 'active':
      case 'in progress':
      case 'in-progress':
        return 'bg-neon-blue/20 text-neon-blue';
      case 'completed':
      case 'done':
        return 'bg-neon-green/20 text-neon-green';
      case 'planning':
        return 'bg-neon-purple/20 text-neon-purple';
      case 'paused':
      case 'on hold':
        return 'bg-neon-yellow/20 text-neon-yellow';
      default:
        return 'bg-gray-200/20 text-gray-500';
    }
  };

  return (
    <div className="rounded-md overflow-hidden">
      <Table>
        <TableHeader className="bg-[#1C2A3A]">
          <TableRow>
            <TableHead className="w-[300px] text-[#CBD5E1]">Name</TableHead>
            <TableHead className="text-[#CBD5E1]">Status</TableHead>
            <TableHead className="text-[#CBD5E1] hidden md:table-cell">Created</TableHead>
            <TableHead className="text-[#CBD5E1] hidden md:table-cell">Tasks</TableHead>
            <TableHead className="text-right text-[#CBD5E1]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow 
              key={project.id}
              onClick={() => onProjectClick(project.id)}
              className="cursor-pointer hover:bg-[#1C2A3A] border-b border-[#3A4D62]/30"
            >
              <TableCell className="font-medium text-[#F1F5F9]">
                <div className="flex items-center space-x-2">
                  <Grid3X3 className="h-4 w-4 text-neon-aqua" />
                  <span>{project.title}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={`${getStatusColor(project.status)}`}>
                  {project.status || 'Open'}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell text-[#CBD5E1]">
                {formatDateRelative(new Date(project.created_at))}
              </TableCell>
              <TableCell className="hidden md:table-cell text-[#CBD5E1]">
                {project.task_count || 0} ({project.completed_count || 0} completed)
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={(e) => {
                  e.stopPropagation();
                  onProjectClick(project.id);
                }}>
                  <ArrowRight className="h-4 w-4 text-[#CBD5E1]" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={5}>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full border border-dashed border-[#3A4D62]/50 text-[#CBD5E1] hover:bg-[#1C2A3A]/50"
                onClick={onCreateProject}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
