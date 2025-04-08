
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getRecentTickets } from '@/api';
import { Bell, Filter, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TaskList } from '@/components/mission/TaskList';
import type { Ticket } from '@/api/tickets';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface RecentTicketsProps {
  compact?: boolean;
  fullView?: boolean;
}

export function RecentTickets({ compact = false, fullView = false }: RecentTicketsProps) {
  const navigate = useNavigate();
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  
  const { data: tickets = [], isLoading, error } = useQuery({
    queryKey: ['recentTickets'],
    queryFn: getRecentTickets,
  });

  // Check if the mission exists before opening the dialog
  const handleMissionClick = async (missionId: string) => {
    try {
      // Verify the mission ID exists in the database
      const { data, error } = await supabase
        .from('tickets')
        .select('id')
        .eq('id', missionId)
        .single();
      
      if (error || !data) {
        console.error("Error validating mission ID:", error);
        toast({
          title: "Error",
          description: "The selected mission could not be found",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedMissionId(missionId);
    } catch (err) {
      console.error("Error checking mission:", err);
      toast({
        title: "Error",
        description: "Failed to load mission tasks",
        variant: "destructive"
      });
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'info';
      case 'in progress':
        return 'warning';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className={compact ? "space-y-2" : "bg-[#25384D] rounded-lg p-4 border border-[#3A4D62] shadow-[0_0_15px_rgba(0,247,239,0.15)] hover:shadow-[0_0_20px_rgba(0,247,239,0.25)] transition-all duration-300 space-y-4"}>
        {!compact && (
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-[#F1F5F9] flex items-center">
              <div className="w-2 h-2 rounded-full bg-neon-green mr-2"></div>
              Recent Missions
            </h3>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[#CBD5E1] hover:text-[#F1F5F9]">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        )}
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full bg-[#3A4D62]" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px] bg-[#3A4D62]" />
              <Skeleton className="h-4 w-[150px] bg-[#3A4D62]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={compact ? "text-center py-2" : "bg-[#25384D] rounded-lg p-4 border border-[#3A4D62] shadow-md text-center py-8"}>
        <p className="text-sm text-[#CBD5E1]">Failed to load recent missions</p>
      </div>
    );
  }

  return (
    <div className={compact ? "" : "bg-[#25384D] rounded-lg p-4 border border-[#3A4D62] shadow-[0_0_15px_rgba(0,247,239,0.15)] hover:shadow-[0_0_20px_rgba(0,247,239,0.25)] transition-all duration-300"}>
      {!compact && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[#F1F5F9] flex items-center">
            <div className="w-2 h-2 rounded-full bg-neon-green mr-2"></div>
            Recent Missions
          </h3>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[#CBD5E1] hover:text-[#F1F5F9]">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[#CBD5E1] hover:text-[#F1F5F9]">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {tickets && tickets.length > 0 ? (
        <div className="space-y-2">
          {tickets.slice(0, compact && !fullView ? 3 : undefined).map((ticket: Ticket) => (
            <motion.div
              key={ticket.id}
              className={`p-3 border border-[#3A4D62] rounded-md transition-all cursor-pointer ${
                compact ? 'bg-[#1C2A3A]/60 hover:bg-[#25384D]' : 'bg-[#1C2A3A] hover:shadow-[0_0_10px_rgba(0,247,239,0.2)]'
              }`}
              whileHover={{ scale: 1.01 }}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => handleMissionClick(ticket.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-[#F1F5F9]">{ticket.title}</h4>
                  <div className="flex items-center mt-1 space-x-2">
                    <Badge variant={getStatusVariant(ticket.status)}>{ticket.status}</Badge>
                    <span className="text-xs text-[#CBD5E1]">{ticket.date}</span>
                  </div>
                </div>
                <div 
                  className={`h-8 w-8 rounded-full flex items-center justify-center bg-neon-green/10 ${
                    ticket.priority === 'High' ? 'text-neon-red' : 'text-neon-green'
                  }`}
                >
                  {ticket.priority === 'High' ? (
                    <Bell className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-bold">
                      {ticket.priority.charAt(0)}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-center py-4 text-sm text-[#CBD5E1]">No recent missions found</p>
      )}

      {!compact && tickets && tickets.length > 0 && (
        <div className="mt-4 text-center">
          <Button variant="link" className="text-sm text-neon-aqua hover:text-neon-aqua/80 hover:shadow-[0_0_8px_rgba(0,247,239,0.4)]">
            View All Missions
          </Button>
        </div>
      )}

      {/* Mission Tasks Dialog */}
      {selectedMissionId && (
        <Dialog open={!!selectedMissionId} onOpenChange={() => setSelectedMissionId(null)}>
          <DialogContent className="bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9] max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-neon-aqua">Mission Tasks</DialogTitle>
            </DialogHeader>
            <div className="py-4 overflow-hidden">
              <TaskList missionId={selectedMissionId} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
