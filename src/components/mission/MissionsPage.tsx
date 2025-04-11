
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Table, List, Zap, Grid3X3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MissionTableView } from '@/components/mission/MissionTableView';
import { MissionCreateButton } from '@/components/mission/MissionCreateButton';
import { MissionTaskEditor } from '@/components/mission/MissionTaskEditor';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/supabase';
import { HomeButton } from '@/components/HomeButton';
import { useToast } from '@/hooks/use-toast';

export function MissionsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { missionId, taskId } = useParams();
  const [viewMode, setViewMode] = useState<'table' | 'list'>('table');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(taskId || null);
  const [isTaskEditorOpen, setIsTaskEditorOpen] = useState<boolean>(!!taskId);
  
  // Reset selectedTaskId when taskId param changes
  useEffect(() => {
    setSelectedTaskId(taskId || null);
    setIsTaskEditorOpen(!!taskId);
  }, [taskId]);
  
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
        
        return (data || []).map(mission => ({
          id: mission.id,
          name: mission.title || 'Untitled Mission'
        }));
      } catch (err) {
        console.error('Error in mission fetch:', err);
        return [];
      }
    }
  });

  // Select first mission by default if no missionId provided
  useEffect(() => {
    if (missions && missions.length > 0 && !missionId) {
      navigate(`/missions/${missions[0].id}`);
    }
  }, [missions, missionId, navigate]);

  const handleTaskClick = (taskId: string) => {
    if (missionId) {
      navigate(`/missions/${missionId}/tasks/${taskId}`);
    }
  };
  
  const handleCloseTaskEditor = () => {
    setIsTaskEditorOpen(false);
    if (missionId) {
      navigate(`/missions/${missionId}`);
    } else {
      navigate('/missions');
    }
  };
  
  const handleMissionSelect = (missionId: string) => {
    navigate(`/missions/${missionId}`);
  };
  
  const handleMissionCreated = (missionId: string) => {
    navigate(`/missions/${missionId}`);
    toast({
      title: "Mission created",
      description: "Your new mission has been created successfully",
    });
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
      <HomeButton />
      <div className="p-4 pb-0">
        <div className="flex justify-between items-center mb-6">
          <Tabs defaultValue="missions">
            <TabsList className="bg-[#1C2A3A]">
              <TabsTrigger value="missions" className="data-[state=active]:bg-[#3A4D62]">
                <Zap className="h-4 w-4 mr-2" />
                Missions
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
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
            
            <MissionCreateButton onMissionCreated={handleMissionCreated} />
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {missions && missions.length > 0 && missions.map((mission) => (
              <Button
                key={mission.id}
                variant="outline"
                size="sm"
                className={`whitespace-nowrap ${
                  missionId === mission.id 
                  ? "bg-neon-green/20 border-neon-green text-neon-green" 
                  : "bg-transparent"
                }`}
                onClick={() => handleMissionSelect(mission.id)}
              >
                {mission.name}
              </Button>
            ))}

            {(!missions || missions.length === 0) && (
              <div className="text-sm text-[#64748B] p-2">
                No missions found. Create one using the button above.
              </div>
            )}
          </div>
        </div>

        <Card className="w-full bg-[#25384D] border-[#3A4D62] shadow-[0_0_15px_rgba(0,247,239,0.1)]">
          <CardContent className="p-6">
            {missionId && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {viewMode === 'table' ? (
                  <MissionTableView 
                    missionId={missionId} 
                    onTaskClick={handleTaskClick}
                  />
                ) : (
                  <div className="p-4 text-center text-[#CBD5E1]">
                    <p>List view coming soon</p>
                  </div>
                )}
              </motion.div>
            )}

            {!missionId && (
              <div className="p-4 text-center text-[#CBD5E1]">
                <p>Select a mission to view tasks</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Task Editor Dialog for Missions view */}
        {selectedTaskId && (
          <Dialog open={isTaskEditorOpen} onOpenChange={handleCloseTaskEditor}>
            <DialogContent className="sm:max-w-[700px] p-0 bg-[#25384D] border-[#3A4D62]">
              <MissionTaskEditor 
                taskId={selectedTaskId}
                onClose={handleCloseTaskEditor}
                onRefresh={() => {
                  // Refresh the current view if needed
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
