
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { PlusCircle, CheckCircle, Edit, Trash, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Task, SubTask } from '@/utils/types';
import { formatDistanceToNow } from 'date-fns';
import { TaskCreateDialog } from './modals/TaskCreateDialog';
import { TaskEditDialog } from './modals/TaskEditDialog';
import { SubtaskCreateDialog } from './modals/SubtaskCreateDialog';
import { SubtaskEditDialog } from './modals/SubtaskEditDialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export function TasksPage() {
  const { 
    tasks, 
    subtasks,
    isLoading, 
    error,
    createTask,
    updateTask,
    deleteTask,
    activeTaskId,
    setActiveTaskId,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    isLoadingSubtasks
  } = useTasks();
  
  const { toast } = useToast();
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [isCreateSubtaskOpen, setIsCreateSubtaskOpen] = useState(false);
  const [isEditSubtaskOpen, setIsEditSubtaskOpen] = useState(false);
  const [currentSubtask, setCurrentSubtask] = useState<SubTask | null>(null);
  
  // Calculate the completion percentage of subtasks for a task
  const getCompletionPercentage = (taskId: string): number => {
    if (!subtasks || subtasks.length === 0) return 0;
    
    const filteredSubtasks = subtasks.filter(st => st.parent_task_id === taskId);
    if (filteredSubtasks.length === 0) return 0;
    
    const completedCount = filteredSubtasks.filter(st => st.is_completed).length;
    return Math.round((completedCount / filteredSubtasks.length) * 100);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'info';
      case 'in-progress':
        return 'warning';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'success';
      case 'medium':
        return 'info';
      case 'high':
        return 'warning';
      case 'urgent':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const handleOpenTask = (taskId: string) => {
    if (activeTaskId === taskId) {
      setActiveTaskId(null);
    } else {
      setActiveTaskId(taskId);
    }
  };

  const handleEditTask = (task: Task) => {
    setCurrentTask(task);
    setIsEditTaskOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this mission?')) {
      deleteTask(taskId);
    }
  };

  const handleEditSubtask = (subtask: SubTask) => {
    setCurrentSubtask(subtask);
    setIsEditSubtaskOpen(true);
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    if (confirm('Are you sure you want to delete this objective?')) {
      deleteSubtask(subtaskId);
    }
  };

  const handleCreateSubtask = () => {
    if (!activeTaskId) {
      toast({
        title: 'Error',
        description: 'No mission selected to add objective to',
        variant: 'destructive'
      });
      return;
    }
    setIsCreateSubtaskOpen(true);
  };

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-neon-red">Error Loading Missions</h3>
              <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
              <Button onClick={() => window.location.reload()} className="mt-4 bg-neon-red text-white hover:brightness-110">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] overflow-y-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Zap className="mr-2 h-5 w-5 text-neon-green" />
          <h2 className="text-2xl font-bold text-foreground">Missions</h2>
        </div>
        <Button 
          onClick={() => setIsCreateTaskOpen(true)}
          className="bg-gradient-to-r from-neon-green to-neon-green/80 text-foreground hover:shadow-[0_0_12px_rgba(182,255,93,0.4)] hover:brightness-110"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Mission
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="w-full border-gray-200">
              <CardHeader className="p-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <Card className="w-full bg-white border border-gray-200">
          <CardContent className="p-8 text-center">
            <div className="mx-auto bg-neon-green/10 p-3 w-12 h-12 flex items-center justify-center mb-4 rounded-full">
              <CheckCircle className="h-6 w-6 text-neon-green" />
            </div>
            <h3 className="text-xl font-medium text-foreground mb-2">No Missions Yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first mission to get started. Track progress, set priorities, and organize with objectives.
            </p>
            <Button 
              onClick={() => setIsCreateTaskOpen(true)}
              className="bg-gradient-to-r from-neon-green to-neon-green/80 text-foreground hover:shadow-[0_0_12px_rgba(182,255,93,0.4)] hover:brightness-110"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create First Mission
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const completionPercent = getCompletionPercentage(task.id);
            return (
              <Collapsible 
                key={task.id} 
                open={activeTaskId === task.id}
                onOpenChange={() => handleOpenTask(task.id)}
                className="w-full"
              >
                <Card className="w-full border-gray-200 hover-scale">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <CollapsibleTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-0 mr-2 h-6 w-6 text-neon-green hover:text-neon-green/80"
                            >
                              {activeTaskId === task.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <CardTitle className="text-lg text-foreground">{task.title}</CardTitle>
                        </div>
                        <div className="flex items-center mt-2 space-x-2">
                          <Badge variant={getStatusColor(task.status)}>
                            {task.status.replace('-', ' ')}
                          </Badge>
                          <Badge variant={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          {task.due_date && (
                            <span className="text-xs text-muted-foreground">
                              Due {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
                            </span>
                          )}
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex space-x-1">
                              {task.tags.map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* Progress bar */}
                        <div className="mt-3 w-full bg-gray-100 rounded-full h-2.5">
                          <div 
                            className="h-2.5 rounded-full bg-neon-green animate-progress"
                            style={{ 
                              width: `${completionPercent}%`, 
                              '--progress-width': `${completionPercent}%` 
                            } as React.CSSProperties}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium text-foreground">{completionPercent}%</span>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTask(task);
                          }}
                          className="h-8 w-8 p-0 text-neon-blue hover:text-neon-blue/80 hover:bg-neon-blue/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(task.id);
                          }}
                          className="h-8 w-8 p-0 text-neon-red hover:text-neon-red/80 hover:bg-neon-red/10"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {task.description && (
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    )}
                  </CardContent>
                  <CollapsibleContent>
                    <div className="px-4 pb-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-medium text-foreground">Objectives</h4>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleCreateSubtask()}
                          className="h-7 text-xs border-neon-green text-neon-green hover:border-neon-green hover:bg-neon-green/10"
                        >
                          <PlusCircle className="mr-1 h-3 w-3" />
                          Add Objective
                        </Button>
                      </div>
                      <div className="space-y-2 pl-6">
                        {isLoadingSubtasks ? (
                          <div className="space-y-2">
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                          </div>
                        ) : subtasks.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic">No objectives yet. Add one to break down your mission.</p>
                        ) : (
                          subtasks.map((subtask) => (
                            <div 
                              key={subtask.id} 
                              className={`flex items-center justify-between p-2 rounded-md border ${subtask.is_completed ? 'border-neon-green/30 bg-neon-green/5' : 'border-gray-200 bg-white'}`}
                            >
                              <div className="flex items-center space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className={`h-6 w-6 p-0 ${subtask.is_completed ? 'text-neon-green' : 'text-muted-foreground'}`}
                                  onClick={() => {
                                    updateSubtask({
                                      ...subtask,
                                      is_completed: !subtask.is_completed
                                    });
                                  }}
                                >
                                  {subtask.is_completed ? (
                                    <CheckCircle className="h-4 w-4" />
                                  ) : (
                                    <div className="h-4 w-4 rounded-full border-2 border-current" />
                                  )}
                                </Button>
                                <span className={`text-sm ${subtask.is_completed ? 'line-through text-muted-foreground/70' : 'text-foreground'}`}>
                                  {subtask.title}
                                </span>
                              </div>
                              <div className="flex space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleEditSubtask(subtask)}
                                  className="h-6 w-6 p-0 text-neon-blue hover:text-neon-blue/80 hover:bg-neon-blue/10"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleDeleteSubtask(subtask.id)}
                                  className="h-6 w-6 p-0 text-neon-red hover:text-neon-red/80 hover:bg-neon-red/10"
                                >
                                  <Trash className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      )}

      <TaskCreateDialog 
        open={isCreateTaskOpen} 
        onOpenChange={setIsCreateTaskOpen}
        onSubmit={createTask}
      />

      {currentTask && (
        <TaskEditDialog 
          open={isEditTaskOpen} 
          onOpenChange={setIsEditTaskOpen}
          task={currentTask}
          onSubmit={updateTask}
        />
      )}

      {activeTaskId && (
        <SubtaskCreateDialog
          open={isCreateSubtaskOpen}
          onOpenChange={setIsCreateSubtaskOpen}
          taskId={activeTaskId}
          onSubmit={createSubtask}
        />
      )}

      {currentSubtask && (
        <SubtaskEditDialog
          open={isEditSubtaskOpen}
          onOpenChange={setIsEditSubtaskOpen}
          subtask={currentSubtask}
          onSubmit={updateSubtask}
        />
      )}
    </div>
  );
}
