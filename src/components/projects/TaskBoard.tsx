import React from 'react';
import { motion } from 'framer-motion';
import { 
  ClockIcon, 
  AlertCircle, 
  Tag, 
  MessageSquare, 
  CheckSquare, 
  MoreHorizontal,
  ChevronRight 
} from 'lucide-react';
import { Task } from '@/utils/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface TaskBoardProps {
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
}

export function TaskBoard({ tasks, onTaskClick }: TaskBoardProps) {
  // Group tasks by status
  const columns: Column[] = [
    {
      id: 'backlog',
      title: 'Backlog',
      tasks: tasks.filter(task => task.status === 'open'),
      color: 'from-neon-purple/20 to-neon-purple/10'
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      tasks: tasks.filter(task => task.status === 'in-progress'),
      color: 'from-neon-blue/20 to-neon-blue/10'
    },
    {
      id: 'completed',
      title: 'Completed',
      tasks: tasks.filter(task => 
        task.status === 'completed' || task.status === 'closed' || task.status === 'resolved'
      ),
      color: 'from-neon-green/20 to-neon-green/10'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch(priority.toLowerCase()) {
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

  const formatDueDate = (date: string | null): string => {
    if (!date) return 'No due date';
    return new Date(date).toLocaleDateString();
  };

  const renderDueDate = (dueDate: string | null) => {
    if (!dueDate) return null;
    
    const date = new Date(dueDate);
    const isOverdue = date < new Date();
    
    return (
      <div className={`flex items-center text-xs ${isOverdue ? 'text-red-400' : 'text-gray-400'}`}>
        <ClockIcon className="w-3 h-3 mr-1" />
        <span>{formatDueDate(dueDate)}</span>
      </div>
    );
  };

  const renderSubtaskProgress = (taskId: string) => {
    // In a real implementation, we would fetch subtasks for each task
    // For now, we'll simulate with random data
    const completed = Math.floor(Math.random() * 5); 
    const total = Math.floor(Math.random() * 5) + completed;
    
    if (total === 0) return null;
    
    return (
      <div className="flex items-center text-xs text-gray-400">
        <CheckSquare className="w-3 h-3 mr-1" />
        <span>{completed}/{total}</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full pb-8">
      {columns.map(column => (
        <div key={column.id} className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full bg-${column.id === 'completed' ? 'neon-green' : column.id === 'in-progress' ? 'neon-blue' : 'neon-purple'} mr-2`}></div>
              <h3 className="font-medium text-[#F1F5F9]">{column.title}</h3>
              <Badge variant="outline" className="ml-2 bg-[#1C2A3A] text-[#CBD5E1]">
                {column.tasks.length}
              </Badge>
            </div>
            <MoreHorizontal className="w-4 h-4 text-[#CBD5E1]" />
          </div>
          
          <div className={`flex-grow bg-gradient-to-b ${column.color} rounded-md p-2 overflow-y-auto`}>
            {column.tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center text-sm text-[#CBD5E1]">
                <p>No tasks</p>
              </div>
            ) : (
              <div className="space-y-3">
                {column.tasks.map(task => (
                  <motion.div
                    key={task.id}
                    layoutId={task.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onTaskClick(task.id)}
                    className="bg-[#1C2A3A] border border-[#3A4D62] rounded-md p-3 cursor-pointer shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm text-[#F1F5F9]">{task.title}</h4>
                      <Badge className={`${getPriorityColor(task.priority)} bg-transparent`}>
                        {task.priority}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className="text-xs text-[#CBD5E1] mt-2 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex space-x-2">
                        {task.assignee_id && (
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${task.assignee_id}`} />
                            <AvatarFallback className="text-[9px]">
                              {task.assignee_id.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        {renderDueDate(task.due_date)}
                      </div>
                      
                      <div className="flex space-x-2">
                        {renderSubtaskProgress(task.id)}
                        <ChevronRight className="w-3 h-3 text-[#CBD5E1]" />
                      </div>
                    </div>
                    
                    {task.tags && task.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
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
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
