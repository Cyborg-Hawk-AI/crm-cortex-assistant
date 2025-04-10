
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CheckSquare, Clock, Filter, MoreHorizontal, SortAsc, SortDesc } from 'lucide-react';
import { Task } from '@/utils/types';

interface TaskTableProps {
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
}

export function TaskTable({ tasks, onTaskClick }: TaskTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
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

  const formatDate = (dateString: string | null | Date) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Sort tasks based on current sort settings
  const sortedTasks = [...tasks].sort((a, b) => {
    if (!sortColumn) return 0;
    
    let valueA, valueB;
    
    switch (sortColumn) {
      case 'title':
        valueA = a.title;
        valueB = b.title;
        break;
      case 'status':
        valueA = a.status;
        valueB = b.status;
        break;
      case 'priority':
        valueA = a.priority;
        valueB = b.priority;
        break;
      case 'due':
        valueA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
        valueB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
        break;
      case 'created':
        valueA = new Date(a.created_at).getTime();
        valueB = new Date(b.created_at).getTime();
        break;
      default:
        return 0;
    }
    
    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="rounded-md overflow-hidden border border-[#3A4D62]">
      <div className="p-2 bg-[#1C2A3A] flex justify-between items-center">
        <div className="text-sm text-[#CBD5E1]">
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} total
        </div>
        <Button variant="ghost" size="sm" className="text-[#CBD5E1]">
          <Filter className="h-3.5 w-3.5 mr-1" />
          Filter
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#1C2A3A]">
            <TableRow className="hover:bg-[#25384D]/80 border-[#3A4D62]">
              <TableHead 
                className="text-left p-4 cursor-pointer"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center">
                  Title
                  {sortColumn === 'title' && (
                    sortDirection === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="text-left p-4 cursor-pointer"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status
                  {sortColumn === 'status' && (
                    sortDirection === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="text-left p-4 cursor-pointer"
                onClick={() => handleSort('priority')}
              >
                <div className="flex items-center">
                  Priority
                  {sortColumn === 'priority' && (
                    sortDirection === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-left p-4">
                Assignee
              </TableHead>
              <TableHead 
                className="text-left p-4 cursor-pointer"
                onClick={() => handleSort('due')}
              >
                <div className="flex items-center">
                  Due Date
                  {sortColumn === 'due' && (
                    sortDirection === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="text-left p-4 cursor-pointer"
                onClick={() => handleSort('created')}
              >
                <div className="flex items-center">
                  Created
                  {sortColumn === 'created' && (
                    sortDirection === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                  )}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTasks.map((task) => (
              <TableRow 
                key={task.id}
                className="hover:bg-[#1C2A3A]/50 border-[#3A4D62] cursor-pointer"
                onClick={() => onTaskClick(task.id)}
              >
                <TableCell className="p-4 font-medium">
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-neon-aqua mr-2" />
                    <span className="text-[#F1F5F9]">{task.title}</span>
                  </div>
                </TableCell>
                <TableCell className="p-4">
                  <Badge className={`${getStatusColor(task.status)} px-2 py-0.5`}>
                    {task.status}
                  </Badge>
                </TableCell>
                <TableCell className="p-4">
                  <Badge className={`${getPriorityColor(task.priority)} px-2 py-0.5`}>
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell className="p-4">
                  {task.assignee_id ? (
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${task.assignee_id}`} />
                      <AvatarFallback>
                        {task.assignee_id.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <span className="text-sm text-[#CBD5E1]">Unassigned</span>
                  )}
                </TableCell>
                <TableCell className="p-4">
                  {task.due_date ? (
                    <div className="flex items-center text-sm text-[#CBD5E1]">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {formatDate(task.due_date)}
                    </div>
                  ) : (
                    <span className="text-sm text-[#CBD5E1]">-</span>
                  )}
                </TableCell>
                <TableCell className="p-4 text-sm text-[#CBD5E1]">
                  {formatDate(task.created_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
