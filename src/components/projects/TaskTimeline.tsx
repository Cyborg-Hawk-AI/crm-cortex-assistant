import React from 'react';
import { Task } from '@/utils/types';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

interface TaskTimelineProps {
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
}

// Define a more specific interface for our tasksByMonth structure
interface TasksByMonth {
  [key: string]: Task[] | string;
}

export function TaskTimeline({ tasks, onTaskClick }: TaskTimelineProps) {
  // Sort tasks by due date
  const sortedTasks = [...tasks].sort((a, b) => {
    const dateA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
    const dateB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
    return dateA - dateB;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'closed':
      case 'resolved':
        return 'bg-neon-green/20 text-neon-green border-neon-green/30';
      case 'in progress':
      case 'in-progress':
        return 'bg-neon-blue/20 text-neon-blue border-neon-blue/30';
      case 'open':
      case 'backlog':
        return 'bg-neon-purple/20 text-neon-purple border-neon-purple/30';
      default:
        return 'bg-gray-200/20 text-gray-500 border-gray-300/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority.toLowerCase()) {
      case 'high':
      case 'urgent':
        return 'bg-neon-red/20 text-neon-red border-neon-red/30';
      case 'medium':
        return 'bg-neon-yellow/20 text-neon-yellow border-neon-yellow/30';
      case 'low':
        return 'bg-neon-aqua/20 text-neon-aqua border-neon-aqua/30';
      default:
        return 'bg-gray-200/20 text-gray-500 border-gray-300/30';
    }
  };
  
  // Group tasks by month
  const tasksByMonth: TasksByMonth = {};
  
  sortedTasks.forEach(task => {
    if (task.due_date) {
      const date = new Date(task.due_date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const monthName = date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
      
      if (!tasksByMonth[monthKey]) {
        tasksByMonth[monthKey] = [];
        tasksByMonth[`${monthKey}-name`] = monthName;
      }
      
      // Type assertion to ensure we're pushing to an array
      if (Array.isArray(tasksByMonth[monthKey])) {
        (tasksByMonth[monthKey] as Task[]).push(task);
      }
    } else {
      // No due date
      if (!tasksByMonth['no-date']) {
        tasksByMonth['no-date'] = [];
        tasksByMonth['no-date-name'] = 'No Due Date';
      }
      
      // Type assertion to ensure we're pushing to an array
      if (Array.isArray(tasksByMonth['no-date'])) {
        (tasksByMonth['no-date'] as Task[]).push(task);
      }
    }
  });

  // Function to check if a date is in the past
  const isOverdue = (dateStr: string | null) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return date < new Date();
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString();
  };

  // Helper function to get the month name safely
  const getMonthName = (monthKey: string): string => {
    const nameKey = `${monthKey}-name`;
    const name = tasksByMonth[nameKey];
    // Ensure we only return a string
    return typeof name === 'string' ? name : '';
  };

  return (
    <div className="space-y-8">
      {Object.keys(tasksByMonth)
        .filter(key => !key.endsWith('-name'))
        .map(monthKey => (
          <div key={monthKey} className="space-y-3">
            <h3 className="text-lg font-medium text-[#F1F5F9] mb-2">
              {getMonthName(monthKey)}
            </h3>
            <div className="relative">
              <div className="absolute left-4 top-0 w-0.5 h-full bg-[#3A4D62]" />
              <div className="space-y-4">
                {/* Safely render tasks by confirming it's an array and using type assertion */}
                {Array.isArray(tasksByMonth[monthKey]) && (tasksByMonth[monthKey] as Task[]).map(task => (
                  <div 
                    key={task.id}
                    className="relative pl-10"
                    onClick={() => onTaskClick(task.id)}
                  >
                    <div className={`absolute left-2 top-4 w-4 h-4 rounded-full 
                      ${task.status.includes('complete') || task.status.includes('resolved') ? 'bg-neon-green' : 
                        isOverdue(task.due_date) ? 'bg-neon-red' : 'bg-neon-blue'} z-10`}
                    />
                    <Card 
                      className="bg-[#1C2A3A] border-[#3A4D62] hover:border-neon-aqua/50 cursor-pointer transition-all"
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h4 className="font-medium text-[#F1F5F9]">{task.title}</h4>
                            {task.description && (
                              <p className="text-sm text-[#CBD5E1] line-clamp-1">{task.description}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            <Badge className={getStatusColor(task.status)}>
                              {task.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            {task.assignee_id && (
                              <div className="flex items-center space-x-1">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${task.assignee_id}`} />
                                  <AvatarFallback className="text-[10px]">
                                    {task.assignee_id.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-[#CBD5E1]">
                                  {task.assignee_id.substring(0, 8)}
                                </span>
                              </div>
                            )}
                            {task.tags && task.tags.length > 0 && (
                              <div className="flex gap-1">
                                {task.tags.slice(0, 2).map((tag, idx) => (
                                  <Badge key={idx} variant="outline" className="text-[10px] py-0 h-4 bg-[#25384D]">
                                    {tag}
                                  </Badge>
                                ))}
                                {task.tags.length > 2 && (
                                  <Badge variant="outline" className="text-[10px] py-0 h-4 bg-[#25384D]">
                                    +{task.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className={`text-xs ${isOverdue(task.due_date) ? 'text-neon-red' : 'text-[#CBD5E1]'}`}>
                            {formatDate(task.due_date)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
