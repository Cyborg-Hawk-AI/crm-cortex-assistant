
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, 
  CalendarIcon, 
  Edit2Icon, 
  KanbanIcon, 
  ListIcon, 
  MoreHorizontal,
  TableIcon,
  Timeline
} from 'lucide-react';
import { Project, Task, TaskView } from '@/utils/types';
import { TaskBoard } from '@/components/projects/TaskBoard';
import { TaskTable } from '@/components/projects/TaskTable';
import { TaskTimeline } from '@/components/projects/TaskTimeline';

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
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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
            <Button variant="outline" size="sm" className="border-[#3A4D62]">
              <Edit2Icon className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {project.description && (
          <p className="text-[#CBD5E1] mt-2 text-sm">{project.description}</p>
        )}
        {renderProgressBar()}
      </CardHeader>
      <CardContent className="p-0 flex-grow overflow-hidden flex flex-col">
        <div className="border-b border-[#3A4D62] p-4">
          <Tabs 
            defaultValue={currentView} 
            value={currentView}
            onValueChange={(value) => setCurrentView(value as TaskView)}
            className="w-full"
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
                  <Timeline className="h-4 w-4 mr-2" />
                  Timeline
                </TabsTrigger>
              </TabsList>
              
              <Button className="bg-neon-aqua text-black hover:bg-neon-aqua/90">
                Add Task
              </Button>
            </div>
          </Tabs>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <TabsContent value="board" className="m-0 h-full">
            <TaskBoard tasks={tasks} onTaskClick={onTaskSelect} />
          </TabsContent>
          <TabsContent value="table" className="m-0 h-full">
            <TaskTable tasks={tasks} onTaskClick={onTaskSelect} />
          </TabsContent>
          <TabsContent value="timeline" className="m-0 h-full">
            <TaskTimeline tasks={tasks} onTaskClick={onTaskSelect} />
          </TabsContent>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
