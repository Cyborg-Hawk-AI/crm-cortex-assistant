
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PlusCircle, BookOpen, Table, List, Zap, Grid3X3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MissionTableView } from '@/components/mission/MissionTableView';
import { MissionCreateButton } from '@/components/mission/MissionCreateButton';
import { MissionTaskEditor } from '@/components/mission/MissionTaskEditor';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/supabase';
import { ProjectsPage } from '@/components/projects/ProjectsPage';

interface TasksPageProps {
  openCreateTask?: boolean;
  setOpenCreateTask?: (open: boolean) => void;
  selectedTaskId?: string | null;
  setSelectedTaskId?: (id: string | null) => void;
  isTaskEditorOpen?: boolean;
  setIsTaskEditorOpen?: (open: boolean) => void;
}

export function TasksPage({
  openCreateTask = false,
  setOpenCreateTask = () => {},
  selectedTaskId = null,
  setSelectedTaskId = () => {},
  isTaskEditorOpen = false,
  setIsTaskEditorOpen = () => {},
}: TasksPageProps) {
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<string>('projects'); // 'projects' or 'missions'
  const [viewMode, setViewMode] = useState<'table' | 'list'>('table');
  const [localSelectedTaskId, setLocalSelectedTaskId] = useState<string | null>(selectedTaskId);
  const [localIsTaskEditorOpen, setLocalIsTaskEditorOpen] = useState<boolean>(isTaskEditorOpen);
  
  // Use props values if provided, otherwise use local state
  const effectiveSelectedTaskId = selectedTaskId !== null ? selectedTaskId : localSelectedTaskId;
  const effectiveIsTaskEditorOpen = isTaskEditorOpen !== undefined ? isTaskEditorOpen : localIsTaskEditorOpen;
  
  // Fetch missions from the database
  const { data: missions = [], isLoading: loadingMissions } = useQuery({
    queryKey: ['missions'],
    queryFn: async () => {
      const userId = await getCurrentUserId();
      if (!userId) return [];
      
      try {
        // We'll consider top-level tasks (without parent_task_id) as missions
        const { data, error } = await supabase
          .from('tasks')
          .select('id, title')
          .is('parent_task_id', null)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching missions:', error);
          return [];
        }
        
        return data.map(mission => ({
          id: mission.id,
          name: mission.title
        }));
      } catch (err) {
        console.error('Error in mission fetch:', err);
        return [];
      }
    }
  });

  // Select first mission by default for the missions tab
  useEffect(() => {
    if (missions.length > 0 && !effectiveSelectedTaskId && activeView === 'missions') {
      handleMissionSelect(missions[0].id);
    }
  }, [missions, effectiveSelectedTaskId, activeView]);

  const handleTaskClick = (taskId: string) => {
    if (setSelectedTaskId) {
      setSelectedTaskId(taskId);
    } else {
      setLocalSelectedTaskId(taskId);
    }
    
    if (setIsTaskEditorOpen) {
      setIsTaskEditorOpen(true);
    } else {
      setLocalIsTaskEditorOpen(true);
    }
  };
  
  const handleCloseTaskEditor = () => {
    if (setIsTaskEditorOpen) {
      setIsTaskEditorOpen(false);
    } else {
      setLocalIsTaskEditorOpen(false);
    }
  };
  
  const handleMissionSelect = (missionId: string) => {
    if (setSelectedTaskId) {
      setSelectedTaskId(missionId);
    } else {
      setLocalSelectedTaskId(missionId);
    }
  };
  
  if (loadingMissions) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="w-full max-w-lg p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-700/50 rounded-md w-1/3"></div>
            <div className="h-40 bg-gray-700/50 rounded-md"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] overflow-y-auto">
      <div className="p-4 pb-0">
        <div className="flex justify-between items-center mb-6">
          <Tabs 
            defaultValue={activeView}
            value={activeView}
            onValueChange={setActiveView}
          >
            <TabsList className="bg-[#1C2A3A]">
              <TabsTrigger value="projects" className="data-[state=active]:bg-[#3A4D62]">
                <Grid3X3 className="h-4 w-4 mr-2" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="missions" className="data-[state=active]:bg-[#3A4D62]">
                <Zap className="h-4 w-4 mr-2" />
                Missions
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {activeView === 'missions' && (
            <div className="flex items-center gap-2">
              <div className="bg-[#1C2A3A] rounded-md p-1 flex">
                <Button 
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className={`rounded-sm ${viewMode === 'table' ? 'bg-neon-aqua text-black' : 'text-[#CBD5E1]'}`}
                >
                  <Table className="h-4 w-4 mr-1" />
                  Table
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`rounded-sm ${viewMode === 'list' ? 'bg-neon-aqua text-black' : 'text-[#CBD5E1]'}`}
                >
                  <List className="h-4 w-4 mr-1" />
                  List
                </Button>
              </div>
              
              <MissionCreateButton onMissionCreated={(missionId) => handleMissionSelect(missionId)} />
            </div>
          )}
        </div>
      </div>

      {activeView === 'projects' ? (
        <ProjectsPage />
      ) : (
        <div className="p-4">
          <div className="mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {missions.map((mission) => (
                <Button
                  key={mission.id}
                  variant="outline"
                  size="sm"
                  className={`whitespace-nowrap ${
                    effectiveSelectedTaskId === mission.id 
                    ? "bg-neon-green/20 border-neon-green text-neon-green" 
                    : "bg-transparent"
                  }`}
                  onClick={() => handleMissionSelect(mission.id)}
                >
                  {mission.name}
                </Button>
              ))}
            </div>
          </div>

          <Card className="w-full bg-[#25384D] border-[#3A4D62] shadow-[0_0_15px_rgba(0,247,239,0.1)]">
            <CardContent className="p-6">
              {effectiveSelectedTaskId && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {viewMode === 'table' ? (
                    <MissionTableView 
                      missionId={effectiveSelectedTaskId} 
                      onTaskClick={handleTaskClick}
                    />
                  ) : (
                    <div className="p-4 text-center text-[#CBD5E1]">
                      <p>List view coming soon</p>
                    </div>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>
          
          {/* Task Editor Dialog for Missions view */}
          {effectiveSelectedTaskId && (
            <Dialog open={effectiveIsTaskEditorOpen} onOpenChange={handleCloseTaskEditor}>
              <DialogContent className="sm:max-w-[700px] p-0 bg-[#25384D] border-[#3A4D62]">
                <MissionTaskEditor 
                  taskId={effectiveSelectedTaskId}
                  onClose={handleCloseTaskEditor}
                  onRefresh={() => {}}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}
    </div>
  );
}
