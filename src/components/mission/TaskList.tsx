
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarIcon, CheckCircle2, Clock, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface TaskListProps {
  projectId: string;
  onTaskClick?: (taskId: string) => void;
}

export function TaskList({ projectId, onTaskClick }: TaskListProps) {
  const navigate = useNavigate();
  
  // Fetch tasks for the given project ID
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('parent_task_id', projectId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error('Error fetching tasks:', err);
        return [];
      }
    },
    enabled: !!projectId
  });

  const getPriorityColor = (priority: string) => {
    switch(priority?.toLowerCase()) {
      case 'high':
      case 'urgent':
        return 'text-neon-red';
      case 'medium':
        return 'text-neon-yellow';
      case 'low':
        return 'text-neon-aqua';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'done':
      case 'closed':
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const handleTaskClick = (taskId: string) => {
    if (onTaskClick) {
      onTaskClick(taskId);
    } else {
      navigate(`/projects/${projectId}/tasks/${taskId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="py-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-[#1C2A3A]/60 rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!tasks.length) {
    return (
      <div className="py-6 text-center bg-[#1C2A3A]/30 rounded-md border border-[#3A4D62]/50 border-dashed">
        <div className="flex flex-col items-center justify-center space-y-3 px-4 py-6">
          <div className="p-3 rounded-full bg-[#1C2A3A]/50">
            <CheckCircle2 className="h-8 w-8 text-[#3A4D62]" />
          </div>
          <p className="text-[#CBD5E1]">No tasks found for this project</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 border-[#3A4D62] hover:bg-[#3A4D62]/50"
          >
            Add first task
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 py-2">
      {tasks.map(task => (
        <div 
          key={task.id} 
          className="flex items-center justify-between p-3 rounded-md hover:bg-[#1C2A3A] cursor-pointer transition-all duration-200 border border-transparent hover:border-[#3A4D62]/50 hover:shadow-sm"
          onClick={() => handleTaskClick(task.id)}
        >
          <div className="flex items-center space-x-3">
            <Checkbox 
              checked={task.status === 'completed' || task.status === 'closed'}
              className="border-[#3A4D62]"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex flex-col">
              <span className={
                task.status === 'completed' || task.status === 'closed'
                  ? 'line-through text-[#CBD5E1]/50'
                  : 'text-[#F1F5F9]'
              }>
                {task.title}
              </span>
              {task.description && (
                <span className="text-xs text-[#CBD5E1]/70 mt-1 line-clamp-1">
                  {task.description}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={`${getStatusColor(task.status)} text-xs`}>
              {task.status}
            </Badge>
            
            {task.due_date && (
              <div className="flex items-center text-xs text-[#CBD5E1]">
                <Clock className="w-3 h-3 mr-1" />
                <span>{formatDate(task.due_date)}</span>
              </div>
            )}
            
            {task.priority && (
              <div className={`${getPriorityColor(task.priority)} text-xs flex items-center`}>
                <span>{task.priority}</span>
              </div>
            )}
            
            {task.assignee_id && (
              <Avatar className="h-6 w-6">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${task.assignee_id}`} />
                <AvatarFallback>{task.assignee_id.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            )}
            
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                handleTaskClick(task.id);
              }}
            >
              <ArrowUpRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
