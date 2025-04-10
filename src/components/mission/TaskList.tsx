
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarIcon, CheckCircle2, Clock } from 'lucide-react';

interface TaskListProps {
  projectId: string;
}

export function TaskList({ projectId }: TaskListProps) {
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
      <div className="py-4 text-center text-[#CBD5E1]">
        <p>No tasks found for this project</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 py-2">
      {tasks.map(task => (
        <div 
          key={task.id} 
          className="flex items-center justify-between p-2 rounded-md hover:bg-[#1C2A3A]/50 cursor-pointer"
        >
          <div className="flex items-center">
            <Checkbox 
              checked={task.status === 'completed' || task.status === 'closed'}
              className="mr-3 border-[#3A4D62]"
            />
            <span className={
              task.status === 'completed' || task.status === 'closed'
                ? 'line-through text-[#CBD5E1]/50'
                : 'text-[#F1F5F9]'
            }>
              {task.title}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {task.due_date && (
              <Badge variant="outline" className="flex items-center bg-[#1C2A3A]/50">
                <Clock className="w-3 h-3 mr-1" />
                <span>{formatDate(task.due_date)}</span>
              </Badge>
            )}
            
            {task.priority && (
              <Badge variant="outline" className={`${getPriorityColor(task.priority)} bg-transparent`}>
                {task.priority}
              </Badge>
            )}
            
            {task.assignee_id && (
              <Avatar className="h-6 w-6">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${task.assignee_id}`} />
                <AvatarFallback>{task.assignee_id.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
