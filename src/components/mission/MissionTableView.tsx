import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronDown, 
  ChevronRight, 
  Clock, 
  Plus,
  MoreHorizontal,
  Check,
  Calendar,
  Flag,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useMissionTasks } from '@/hooks/useMissionTasks';
import { MissionTaskEditor } from './MissionTaskEditor';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface MissionTableViewProps {
  missionId: string;
  onTaskClick?: (taskId: string) => void;
}

export const MissionTableView = ({ missionId, onTaskClick }: MissionTableViewProps) => {
  const navigate = useNavigate();
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');

  const {
    tasks,
    subtasks,
    isLoading,
    error,
    createTask,
    updateTaskStatus,
    updateTaskTitle,
    deleteTask,
    getSubtasks,
    refetch
  } = useMissionTasks(missionId);

  useEffect(() => {
    refetch();
  }, [missionId, refetch]);

  const toggleTaskExpand = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setExpandedTasks(prev => {
      const newState = {
        ...prev,
        [taskId]: !prev[taskId]
      };
      
      if (newState[taskId] && !subtasks[taskId]) {
        getSubtasks(taskId);
      }
      
      return newState;
    });
  };

  const handleStatusChange = (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'open' : 'completed';
    updateTaskStatus(taskId, newStatus);
  };

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) return;
    
    createTask(newTaskTitle, null);
    setNewTaskTitle('');
  };

  const handleTaskClick = (taskId: string) => {
    if (onTaskClick) {
      onTaskClick(taskId);
    } else {
      setSelectedTaskId(taskId);
    }
  };

  const startEditingTitle = (taskId: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTaskId(taskId);
    setEditingTaskTitle(currentTitle);
  };

  const saveTaskTitle = (taskId: string) => {
    if (!editingTaskTitle.trim()) return;
    
    updateTaskTitle(taskId, editingTaskTitle.trim());
    setEditingTaskId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, taskId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveTaskTitle(taskId);
    } else if (e.key === 'Escape') {
      setEditingTaskId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-neon-green/20 text-neon-green border-neon-green/30';
      case 'in-progress':
        return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      default:
        return 'bg-[#3A4D62] text-[#F1F5F9] border-[#3A4D62]/50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-neon-red';
      case 'medium':
        return 'text-amber-500';
      default:
        return 'text-[#64748B]';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="h-6 w-6 rounded-full border-2 border-t-transparent border-neon-aqua animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-neon-red">Error loading tasks: {error.message}</p>
        <Button 
          onClick={() => refetch()} 
          className="mt-4"
          variant="outline"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Input
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9]"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleCreateTask();
            }
          }}
        />
        <Button 
          onClick={handleCreateTask}
          className="bg-neon-aqua hover:bg-neon-aqua/90 text-black"
          disabled={!newTaskTitle.trim()}
        >
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      <div className="rounded-md border border-[#3A4D62] overflow-hidden">
        <Table className="border-collapse">
          <TableHeader className="bg-[#25384D]">
            <TableRow className="border-b border-[#3A4D62] hover:bg-[#25384D]">
              <TableHead className="w-10 text-[#CBD5E1]"></TableHead>
              <TableHead className="w-[40%] text-[#CBD5E1]">Task</TableHead>
              <TableHead className="text-[#CBD5E1]">Status</TableHead>
              <TableHead className="text-[#CBD5E1]">Due Date</TableHead>
              <TableHead className="text-[#CBD5E1]">Priority</TableHead>
              <TableHead className="w-10 text-[#CBD5E1]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow className="hover:bg-[#1C2A3A]">
                <TableCell colSpan={6} className="text-center py-6 text-[#64748B]">
                  No tasks found. Create a new task to get started.
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <>
                  <TableRow 
                    key={task.id} 
                    className={`border-b border-[#3A4D62] hover:bg-[#1C2A3A]/50 cursor-pointer ${
                      selectedTaskId === task.id ? 'bg-[#1C2A3A]/60' : ''
                    }`}
                    onClick={() => handleTaskClick(task.id)}
                  >
                    <TableCell className="p-1 pl-2 align-middle">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-[#64748B] hover:text-[#F1F5F9]"
                          onClick={(e) => toggleTaskExpand(task.id, e)}
                        >
                          {expandedTasks[task.id] ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                        <Checkbox 
                          checked={task.status === 'completed'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(task.id, task.status);
                          }}
                          className="rounded-full"
                        />
                      </div>
                    </TableCell>
                    <TableCell className={`p-2 ${task.status === 'completed' ? 'line-through text-[#64748B]' : 'text-[#F1F5F9]'}`}>
                      {editingTaskId === task.id ? (
                        <div onClick={(e) => e.stopPropagation()}>
                          <Input
                            value={editingTaskTitle}
                            onChange={(e) => setEditingTaskTitle(e.target.value)}
                            className="bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9]"
                            autoFocus
                            onBlur={() => saveTaskTitle(task.id)}
                            onKeyDown={(e) => handleKeyDown(e, task.id)}
                          />
                        </div>
                      ) : (
                        <div 
                          className="flex items-center gap-1" 
                          onDoubleClick={(e) => startEditingTitle(task.id, task.title, e)}
                        >
                          {task.title}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={`px-2 py-0.5 ${getStatusColor(task.status)}`}>
                        {task.status || 'Open'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {task.due_date ? (
                        <div className="flex items-center gap-1 text-[#CBD5E1]">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(task.due_date), 'MMM d, yyyy')}</span>
                        </div>
                      ) : (
                        <span className="text-[#64748B]">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Flag className={`h-4 w-4 ${getPriorityColor(task.priority || 'low')}`} />
                        <span className="text-[#CBD5E1] capitalize">{task.priority || 'Low'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="p-1 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4 text-[#64748B]" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          align="end"
                          className="bg-[#25384D] border-[#3A4D62] text-[#F1F5F9]"
                        >
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditingTitle(task.id, task.title, e);
                            }}
                            className="hover:bg-[#3A4D62]/50"
                          >
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTask(task.id);
                            }}
                            className="hover:bg-neon-red/10 text-neon-red"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  
                  {expandedTasks[task.id] && (
                    <TableRow className="bg-[#1C2A3A]/30 hover:bg-[#1C2A3A]/40">
                      <TableCell colSpan={6} className="p-0">
                        <div className="py-2 px-4 pl-8">
                          <SubtaskList 
                            parentTaskId={task.id}
                            subtasks={subtasks[task.id] || []}
                            onTaskClick={handleTaskClick}
                            onStatusChange={handleStatusChange}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {!onTaskClick && selectedTaskId && (
        <Dialog open={!!selectedTaskId} onOpenChange={() => setSelectedTaskId(null)}>
          <DialogContent className="bg-[#25384D] border-[#3A4D62] text-[#F1F5F9] max-w-4xl max-h-[90vh] overflow-hidden">
            <MissionTaskEditor 
              taskId={selectedTaskId}
              onClose={() => setSelectedTaskId(null)}
              onRefresh={refetch}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

interface SubtaskListProps {
  parentTaskId: string;
  subtasks: any[];
  onTaskClick: (taskId: string) => void;
  onStatusChange: (taskId: string, currentStatus: string) => void;
}

const SubtaskList = ({ parentTaskId, subtasks, onTaskClick, onStatusChange }: SubtaskListProps) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const { createTask } = useMissionTasks(parentTaskId);
  
  const handleCreateSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    createTask(newSubtaskTitle.trim(), parentTaskId);
    setNewSubtaskTitle('');
  };
  
  return (
    <div className="space-y-2">
      {subtasks.length === 0 ? (
        <div className="text-[#64748B] text-sm italic">No subtasks yet</div>
      ) : (
        <div className="space-y-1">
          {subtasks.map((subtask) => (
            <div 
              key={subtask.id}
              className="flex items-center gap-2 p-2 rounded hover:bg-[#3A4D62]/30 cursor-pointer"
              onClick={() => onTaskClick(subtask.id)}
            >
              <Checkbox 
                checked={subtask.status === 'completed'}
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(subtask.id, subtask.status);
                }}
                className="rounded-full"
              />
              <span className={cn(
                "text-sm",
                subtask.status === 'completed' ? 'text-[#64748B] line-through' : 'text-[#F1F5F9]'
              )}>
                {subtask.title}
              </span>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-center gap-2 pt-1">
        <Input
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          placeholder="Add a subtask..."
          className="flex-1 h-8 text-sm bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9]"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleCreateSubtask();
            }
          }}
        />
        <Button 
          onClick={handleCreateSubtask}
          size="sm"
          className="h-8 bg-neon-aqua hover:bg-neon-aqua/90 text-black"
          disabled={!newSubtaskTitle.trim()}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
