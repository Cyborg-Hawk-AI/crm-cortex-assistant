
import React from 'react';
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

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
      return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    case 'in-progress':
      return <Clock className="h-5 w-5 text-amber-500" />;
    case 'blocked':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Circle className="h-5 w-5 text-slate-400" />;
  }
};

const getPriorityClass = (priority: string) => {
  switch(priority) {
    case 'urgent':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'high':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    case 'medium':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
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
  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <div 
          key={task.id}
          className={cn(
            "p-3 rounded-md border flex items-start gap-3",
            task.status === 'completed' ? 'bg-gray-50 border-gray-200' : 'bg-white border-indigo-100'
          )}
        >
          <div className="mt-0.5">
            {getStatusIcon(task.status)}
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn(
              "font-medium truncate",
              task.status === 'completed' ? 'text-gray-500 line-through' : ''
            )}>
              {task.title}
            </p>
            <div className="flex items-center mt-1 text-xs text-gray-500">
              <span className="mr-2">Due: {formatDate(task.dueDate)}</span>
              <span className={cn(
                "px-1.5 py-0.5 rounded text-xs font-medium",
                getPriorityClass(task.priority)
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
