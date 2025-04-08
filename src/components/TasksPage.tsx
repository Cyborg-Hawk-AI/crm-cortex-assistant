
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PlusCircle, BookOpen, Table, List, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MissionTableView } from '@/components/mission/MissionTableView';
import { MissionCreateButton } from '@/components/mission/MissionCreateButton';

export function TasksPage() {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'table' | 'list'>('table');
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  
  // Mock mission for demonstration - In a real implementation, fetch from Supabase
  const missions = [{
    id: "mission-main",
    name: "Main Mission Board"
  }];

  // Select first mission by default
  React.useEffect(() => {
    if (missions.length > 0 && !selectedMissionId) {
      setSelectedMissionId(missions[0].id);
    }
  }, [missions, selectedMissionId]);
  
  if (!missions.length) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Card className="w-full max-w-lg bg-[#25384D] border-[#3A4D62]">
          <CardContent className="pt-6 flex flex-col items-center">
            <div className="text-center">
              <h3 className="text-lg font-medium text-[#F1F5F9] mb-2">Welcome to Missions</h3>
              <p className="text-sm text-[#CBD5E1] mb-6">
                Create your first mission to get started with task management
              </p>
              <MissionCreateButton />
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
          <h2 className="text-2xl font-bold text-[#F1F5F9]">Missions</h2>
        </div>
        
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
          
          <MissionCreateButton />
        </div>
      </div>

      <Card className="w-full bg-[#25384D] border-[#3A4D62] shadow-[0_0_15px_rgba(0,247,239,0.1)]">
        <CardContent className="p-6">
          {selectedMissionId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {viewMode === 'table' ? (
                <MissionTableView missionId={selectedMissionId} />
              ) : (
                <div className="p-4 text-center text-[#CBD5E1]">
                  <p>List view coming soon</p>
                </div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
