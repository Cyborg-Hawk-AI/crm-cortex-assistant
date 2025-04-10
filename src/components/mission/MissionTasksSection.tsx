
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TaskList } from '@/components/mission/TaskList';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TaskCreateDialog } from '@/components/modals/TaskCreateDialog';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/utils/types';
import { Input } from '@/components/ui/input';

interface ProjectTasksSectionProps {
  projectId: string;
  compact?: boolean;
  showCreateButton?: boolean;
}

export function ProjectTasksSection({ 
  projectId, 
  compact = false,
  showCreateButton = false
}: ProjectTasksSectionProps) {
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [isAddingQuickTask, setIsAddingQuickTask] = useState(false);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const { toast } = useToast();

  if (!projectId) {
    return null;
  }
  
  const handleCreateTask = async (taskData: Omit<Task, 'id'>) => {
    try {
      setIsSubmittingTask(true);
      const { data, error } = await supabase
        .from('tasks')
        .insert({ 
          ...taskData, 
          parent_task_id: projectId 
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Task created",
        description: `Task "${taskData.title}" has been created successfully.`,
      });
      
      // Trigger refetch of tasks
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleQuickTaskSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!quickTaskTitle.trim()) return;
    
    try {
      setIsSubmittingTask(true);
      const { data, error } = await supabase
        .from('tasks')
        .insert({ 
          title: quickTaskTitle,
          parent_task_id: projectId 
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Task created",
        description: `Task "${quickTaskTitle}" has been created successfully.`,
      });
      
      setQuickTaskTitle('');
      setIsAddingQuickTask(false);
      
      // Trigger refetch of tasks
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
    } catch (error) {
      console.error('Error creating quick task:', error);
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingTask(false);
    }
  };
  
  if (compact) {
    return (
      <ScrollArea className="max-h-[400px]" hideScrollbar={true}>
        <TaskList projectId={projectId} />
      </ScrollArea>
    );
  }
  
  return (
    <Card className="bg-[#25384D] border-[#3A4D62] shadow-[0_0_15px_rgba(0,247,239,0.1)]">
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <CardTitle className="text-lg font-bold text-[#F1F5F9] flex items-center">
          <div className="w-2 h-2 rounded-full bg-neon-aqua mr-2"></div>
          Tasks
        </CardTitle>
        
        {showCreateButton && !isAddingQuickTask && (
          <Button 
            size="sm" 
            variant="outline" 
            className="border-[#3A4D62] hover:bg-[#3A4D62]/30"
            onClick={() => setIsAddingQuickTask(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            New Task
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isAddingQuickTask && (
          <form 
            onSubmit={handleQuickTaskSubmit} 
            className="mb-4 flex items-center space-x-2"
          >
            <Input 
              value={quickTaskTitle}
              onChange={(e) => setQuickTaskTitle(e.target.value)}
              placeholder="Enter task name and press Enter"
              className="bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9]"
              autoFocus
            />
            <Button 
              type="submit"
              size="sm"
              disabled={isSubmittingTask || !quickTaskTitle.trim()}
              className="bg-neon-aqua hover:bg-neon-aqua/90 text-black"
            >
              {isSubmittingTask ? "Adding..." : "Add"}
            </Button>
            <Button 
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setIsAddingQuickTask(false)}
              className="text-[#CBD5E1]"
            >
              Cancel
            </Button>
          </form>
        )}
        
        <TaskList projectId={projectId} />
      </CardContent>

      {/* Task Create Dialog */}
      <TaskCreateDialog
        open={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
        onSubmit={handleCreateTask}
      />
    </Card>
  );
}
