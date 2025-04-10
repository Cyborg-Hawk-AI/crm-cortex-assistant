
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  CalendarIcon, 
  Edit2Icon, 
  KanbanIcon, 
  ListIcon, 
  MoreHorizontal,
  TableIcon,
  BarChart3,
  Save
} from 'lucide-react';
import { Project, Task, TaskView } from '@/utils/types';
import { TaskBoard } from '@/components/projects/TaskBoard';
import { TaskTable } from '@/components/projects/TaskTable';
import { TaskTimeline } from '@/components/projects/TaskTimeline';
import { TaskList } from '@/components/mission/TaskList';
import { ProjectTasksSection } from '@/components/projects/ProjectTasksSection';
import { TaskCreateDialog } from '@/components/modals/TaskCreateDialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface ProjectDetailProps {
  project: Project;
  tasks: Task[];
  onBack: () => void;
  onTaskSelect: (taskId: string) => void;
  onProjectUpdate?: (project: Project) => void;
}

export function ProjectDetail({ 
  project, 
  tasks, 
  onBack, 
  onTaskSelect,
  onProjectUpdate
}: ProjectDetailProps) {
  const [currentView, setCurrentView] = useState<TaskView>('board');
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [projectTitle, setProjectTitle] = useState(project.title);
  const [projectDescription, setProjectDescription] = useState(project.description || '');
  const { toast } = useToast();
  
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'done':
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
  
  const completedTaskCount = tasks.filter(task => 
    task.status === 'completed' || task.status === 'closed'
  ).length;
  
  const renderProgressBar = () => {
    const percentage = tasks.length > 0 ? (completedTaskCount / tasks.length) * 100 : 0;
    
    return (
      <div className="w-full mt-4">
        <div className="flex justify-between text-xs text-[#CBD5E1] mb-1">
          <span>Progress</span>
          <span>{completedTaskCount}/{tasks.length} completed</span>
        </div>
        <div className="h-1.5 w-full bg-[#1C2A3A] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-neon-aqua to-neon-blue transition-all duration-300" 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  const handleCreateTask = async (taskData: Omit<Task, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({ 
          ...taskData, 
          parent_task_id: project.id 
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Task created",
        description: `Task "${taskData.title}" has been created successfully.`,
      });
      
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
    }
  };

  const toggleEditProject = () => {
    if (!isEditingProject) {
      setIsEditingProject(true);
    } else {
      handleSaveProjectChanges();
    }
  };

  const handleSaveProjectChanges = async () => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          title: projectTitle,
          description: projectDescription,
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id);
        
      if (error) throw error;
      
      if (onProjectUpdate) {
        onProjectUpdate({
          ...project,
          title: projectTitle,
          description: projectDescription,
          updated_at: new Date().toISOString()
        });
      }
      
      setIsEditingProject(false);
      toast({
        title: "Project updated",
        description: "Project details have been saved successfully",
      });
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleMoreOptions = () => {
    toast({
      title: "More Options",
      description: "Additional project options will be implemented soon.",
    });
  };

  return (
    <Card className="bg-[#25384D] border-[#3A4D62] shadow-[0_0_15px_rgba(0,247,239,0.1)] flex flex-col h-full">
      <CardHeader className="p-5 border-b border-[#3A4D62] flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 mr-2" 
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-grow">
              {isEditingProject ? (
                <div className="space-y-2">
                  <Input
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="text-xl font-bold text-[#F1F5F9] bg-[#1C2A3A] border-neon-aqua/50"
                  />
                  <Textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Add project description..."
                    className="bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9] min-h-[60px] resize-none"
                  />
                </div>
              ) : (
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-bold text-[#F1F5F9]">{project.title}</h2>
                    <Badge className={`${getStatusColor(project.status)} px-2 py-0.5`}>
                      {project.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-[#CBD5E1] mt-1">
                    Created {new Date(project.created_at).toLocaleDateString()}
                  </p>
                  {project.description && (
                    <p className="text-[#CBD5E1] mt-2 text-sm">{project.description}</p>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 mr-2">
              <CalendarIcon className="w-4 h-4 text-[#CBD5E1]" />
              <span className="text-sm text-[#CBD5E1]">
                Updated {new Date(project.updated_at).toLocaleDateString()}
              </span>
            </div>
            <Avatar className="h-8 w-8">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${project.owner_id}`} />
              <AvatarFallback>
                {project.owner_id.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button 
              variant="outline" 
              size="sm" 
              className={`border-[#3A4D62] ${isEditingProject ? 'bg-neon-aqua/20' : ''}`}
              onClick={toggleEditProject}
            >
              {isEditingProject ? (
                <>
                  <Save className="h-3.5 w-3.5 mr-1" />
                  Save
                </>
              ) : (
                <>
                  <Edit2Icon className="h-3.5 w-3.5 mr-1" />
                  Edit
                </>
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={handleMoreOptions}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {!isEditingProject && renderProgressBar()}
      </CardHeader>
      <CardContent className="p-0 flex-grow overflow-hidden flex flex-col">
        <div className="border-b border-[#3A4D62] p-4">
          <Tabs 
            defaultValue="board"
            value={currentView}
            onValueChange={(value) => setCurrentView(value as TaskView)}
          >
            <div className="flex justify-between items-center">
              <TabsList className="bg-[#1C2A3A] p-1">
                <TabsTrigger 
                  value="board"
                  className="data-[state=active]:bg-[#3A4D62] data-[state=active]:text-white"
                >
                  <KanbanIcon className="h-4 w-4 mr-2" />
                  Board
                </TabsTrigger>
                <TabsTrigger 
                  value="table"
                  className="data-[state=active]:bg-[#3A4D62] data-[state=active]:text-white"
                >
                  <TableIcon className="h-4 w-4 mr-2" />
                  Table
                </TabsTrigger>
                <TabsTrigger 
                  value="timeline"
                  className="data-[state=active]:bg-[#3A4D62] data-[state=active]:text-white"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Timeline
                </TabsTrigger>
              </TabsList>
              
              <Button 
                className="bg-neon-aqua text-black hover:bg-neon-aqua/90"
                onClick={() => setIsCreateTaskOpen(true)}
              >
                Add Task
              </Button>
            </div>
        
            <div className="mt-4">
              <ScrollArea className="h-[calc(100vh-320px)]">
                <TabsContent value="board" className="m-0 mt-0">
                  <TaskBoard tasks={tasks} onTaskClick={onTaskSelect} />
                </TabsContent>
                <TabsContent value="table" className="m-0 mt-0">
                  <TaskTable tasks={tasks} onTaskClick={onTaskSelect} />
                </TabsContent>
                <TabsContent value="timeline" className="m-0 mt-0">
                  <TaskTimeline tasks={tasks} onTaskClick={onTaskSelect} />
                </TabsContent>
              </ScrollArea>
            </div>
          </Tabs>
        </div>
        
        <div className="p-4 border-t border-[#3A4D62]">
          <h3 className="text-[#F1F5F9] font-medium mb-2">Project Tasks</h3>
          <ProjectTasksSection projectId={project.id} showCreateButton={true} />
        </div>
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
