
import React from 'react';
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useTheme } from '@/contexts/ThemeContext';

const tasks = [
  {
    id: '1',
    title: 'Update weekly progress report',
    status: 'in-progress',
    dueDate: new Date(Date.now() + 86400000), // tomorrow
    priority: 'medium'
  },
  {
    id: '2',
    title: 'Prepare slides for team meeting',
    status: 'not-started',
    dueDate: new Date(Date.now() + 172800000), // in 2 days
    priority: 'high'
  },
  {
    id: '3',
    title: 'Review product roadmap draft',
    status: 'completed',
    dueDate: new Date(Date.now() - 86400000), // yesterday
    priority: 'medium'
  },
  {
    id: '4',
    title: 'Finalize Q2 budget allocation',
    status: 'blocked',
    dueDate: new Date(Date.now() + 259200000), // in 3 days
    priority: 'urgent'
  }
];

const getStatusIcon = (status: string) => {
  switch(status) {
    case 'completed':
      return <CheckCircle2 className="h-5 w-5 text-primary" />;
    case 'in-progress':
      return <Clock className="h-5 w-5 text-primary" />;
    case 'blocked':
      return <AlertCircle className="h-5 w-5 text-primary-foreground" />;
    default:
      return <Circle className="h-5 w-5 text-muted-foreground" />;
  }
};

const getPriorityClass = (priority: string, isDark: boolean) => {
  if (isDark) {
    switch(priority) {
      case 'urgent':
        return 'bg-accent text-accent-foreground';
      case 'high':
        return 'bg-muted text-muted-foreground';
      case 'medium':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-secondary/50 text-muted-foreground';
    }
  } else {
    switch(priority) {
      case 'urgent':
        return 'bg-[#C1EDEA] text-[#264E46]';
      case 'high':
        return 'bg-[#ECEAE3] text-[#264E46]';
      case 'medium':
        return 'bg-[#F5F7FA] text-[#404040]';
      default:
        return 'bg-[#F5F7FA] text-[#BFBFBF]';
    }
  }
};

const formatDate = (date: Date) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  
  if (isToday) return 'Today';
  if (isTomorrow) return 'Tomorrow';
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const TaskList = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <div 
          key={task.id}
          className={cn(
            "p-3 rounded-md border flex items-start gap-3",
            task.status === 'completed' 
              ? isDark ? 'bg-secondary/30 border-muted' : 'bg-[#F5F7FA] border-[#BFBFBF]' 
              : isDark ? 'bg-card border-accent/30' : 'bg-white border-[#C1EDEA]'
          )}
        >
          <div className="mt-0.5">
            {getStatusIcon(task.status)}
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn(
              "font-medium truncate",
              task.status === 'completed' 
                ? isDark ? 'text-muted-foreground line-through' : 'text-[#BFBFBF] line-through' 
                : isDark ? 'text-foreground' : 'text-[#404040]'
            )}>
              {task.title}
            </p>
            <div className="flex items-center mt-1 text-xs text-muted-foreground">
              <span className="mr-2">Due: {formatDate(task.dueDate)}</span>
              <span className={cn(
                "px-1.5 py-0.5 rounded text-xs font-medium",
                getPriorityClass(task.priority, isDark)
              )}>
                {task.priority}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
