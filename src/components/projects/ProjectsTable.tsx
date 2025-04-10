import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarIcon, CheckCircle2, CircleDashed, FilterIcon, MoreHorizontal, PlusCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Project } from '@/utils/types';

interface ProjectsTableProps {
  projects: Project[];
  onProjectClick: (projectId: string) => void;
  onCreateProject: () => void;
}

export function ProjectsTable({ projects, onProjectClick, onCreateProject }: ProjectsTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'done':
        return 'bg-neon-green/20 text-neon-green border-neon-green/30';
      case 'in progress':
      case 'in-progress':
        return 'bg-neon-blue/20 text-neon-blue border-neon-blue/30';
      case 'planning':
      case 'backlog':
        return 'bg-neon-purple/20 text-neon-purple border-neon-purple/30';
      case 'on hold':
        return 'bg-neon-yellow/20 text-neon-yellow border-neon-yellow/30';
      default:
        return 'bg-gray-200/20 text-gray-500 border-gray-300/30';
    }
  };

  const renderCompletionIndicator = (completed: number, total: number) => {
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    return (
      <div className="flex items-center space-x-2">
        <div className="w-24 h-1.5 bg-[#1C2A3A] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-neon-aqua to-neon-blue"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs text-[#CBD5E1]">
          {completed}/{total}
        </span>
      </div>
    );
  };

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation(); // Prevent navigation
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', projectId);
        
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      toast({
        title: "Project deleted",
        description: "The project has been successfully deleted",
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDuplicateProject = async (e: React.MouseEvent, project: Project) => {
    e.stopPropagation(); // Prevent navigation
    
    try {
      // Create a duplicate of the project without the ID
      const { title, description, status, tags, owner_id } = project;
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: `${title} (Copy)`,
          description,
          status,
          tags,
          user_id: owner_id,
          reporter_id: owner_id,
          priority: 'medium',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
        
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      toast({
        title: "Project duplicated",
        description: "A copy of the project has been created",
      });
    } catch (error) {
      console.error('Error duplicating project:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate project. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="bg-[#25384D] border-[#3A4D62] shadow-[0_0_15px_rgba(0,247,239,0.1)]">
      <CardContent className="p-0">
        <div className="flex justify-between items-center p-4 border-b border-[#3A4D62]">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium text-[#F1F5F9]">Projects</h3>
            <Badge variant="outline" className="ml-2 bg-neon-aqua/10 text-neon-aqua border-neon-aqua/30">
              {projects.length}
            </Badge>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="border-[#3A4D62] hover:bg-[#3A4D62]/50">
              <FilterIcon className="w-4 h-4 mr-1" />
              Filter
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#1C2A3A]">
              <TableRow className="hover:bg-[#25384D]/80 border-[#3A4D62]">
                <TableHead 
                  className="text-left p-4 cursor-pointer"
                  onClick={() => handleSort('title')}
                >
                  Project Name
                </TableHead>
                <TableHead 
                  className="text-left p-4 cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  Status
                </TableHead>
                <TableHead 
                  className="text-left p-4 cursor-pointer"
                  onClick={() => handleSort('owner')}
                >
                  Owner
                </TableHead>
                <TableHead 
                  className="text-left p-4 cursor-pointer"
                  onClick={() => handleSort('tasks')}
                >
                  Tasks
                </TableHead>
                <TableHead 
                  className="text-left p-4 cursor-pointer"
                  onClick={() => handleSort('updated')}
                >
                  Last Updated
                </TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow 
                  key={project.id} 
                  className="hover:bg-[#1C2A3A]/70 border-[#3A4D62] cursor-pointer transition-colors group"
                  onClick={() => onProjectClick(project.id)}
                >
                  <TableCell className="p-4 font-medium">
                    <div className="flex items-center space-x-2">
                      {project.icon ? (
                        <span>{project.icon}</span>
                      ) : (
                        <CircleDashed className="w-4 h-4 text-neon-aqua" />
                      )}
                      <span className="text-[#F1F5F9] group-hover:text-white transition-colors">{project.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="p-4">
                    <Badge className={`${getStatusColor(project.status)} px-2 py-1`}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="p-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${project.owner_id}`} />
                            <AvatarFallback>
                              {project.owner_id.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{project.owner_id}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="p-4">
                    {renderCompletionIndicator(
                      project.completed_count || 0, 
                      project.task_count || 0
                    )}
                  </TableCell>
                  <TableCell className="p-4 text-sm text-[#CBD5E1]">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      <span>
                        {new Date(project.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="p-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#1C2A3A] border-[#3A4D62]">
                        <DropdownMenuItem className="text-[#F1F5F9] hover:bg-[#3A4D62]/50">
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-[#F1F5F9] hover:bg-[#3A4D62]/50" 
                          onClick={(e) => handleDuplicateProject(e, project)}
                        >
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-500 hover:bg-red-500/10" 
                          onClick={(e) => handleDeleteProject(e, project.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
