
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TaskList } from '@/components/mission/TaskList';

interface MissionTasksSectionProps {
  missionId: string;
  compact?: boolean;
}

export function MissionTasksSection({ missionId, compact = false }: MissionTasksSectionProps) {
  if (!missionId) {
    return null;
  }
  
  if (compact) {
    return <TaskList missionId={missionId} />;
  }
  
  return (
    <Card className="bg-[#25384D] border-[#3A4D62] shadow-[0_0_15px_rgba(0,247,239,0.1)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-[#F1F5F9] flex items-center">
          <div className="w-2 h-2 rounded-full bg-neon-aqua mr-2"></div>
          Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TaskList missionId={missionId} />
      </CardContent>
    </Card>
  );
}
