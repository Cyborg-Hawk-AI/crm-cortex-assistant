
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getRecentTickets } from '@/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TaskList } from '@/components/mission/TaskList';
import type { Ticket } from '@/api/tickets';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronRight, Edit2, Plus } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Textarea } from '@/components/ui/textarea';

interface RecentTicketsProps {
  compact?: boolean;
  fullView?: boolean;
}

export function RecentTickets({ compact = false, fullView = false }: RecentTicketsProps) {
  const navigate = useNavigate();
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [expandedMission, setExpandedMission] = useState<Record<string, boolean>>({});
  const [editingMissionId, setEditingMissionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  
  const { data: tickets = [], isLoading, error, refetch } = useQuery({
    queryKey: ['recentTickets'],
    queryFn: getRecentTickets,
  });

  useEffect(() => {
    if (editingMissionId && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [editingMissionId]);

  // Check if the mission exists before opening the dialog
  const handleMissionClick = async (missionId: string) => {
    try {
      // Verify the mission ID exists in the tasks table
      const { data, error } = await supabase
        .from('tasks')
        .select('id')
        .eq('id', missionId)
        .single();
      
      if (error || !data) {
        console.error("Error validating mission ID:", error);
        // Check if we should allow mission ID without validation
        // This lets us use the mission ID even if it's not a task itself
        const { data: tasksRelatedToMission } = await supabase
          .from('tasks')
          .select('id')
          .filter('tags', 'cs', `{"mission:${missionId}}`) // Check if any task has this mission tag
          .limit(1);

        if (!tasksRelatedToMission || tasksRelatedToMission.length === 0) {
          toast({
            title: "Error",
            description: "The selected mission could not be found",
            variant: "destructive"
          });
          return;
        }
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

  const toggleMissionExpand = (missionId: string) => {
    setExpandedMission(prev => ({
      ...prev,
      [missionId]: !prev[missionId]
    }));
  };

  const handleEditMission = (mission: Ticket) => {
    setEditingMissionId(mission.id);
    setEditingTitle(mission.title);
    setEditingDescription(mission.description || '');
  };

  const saveMissionChanges = async () => {
    if (!editingMissionId) return;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: editingTitle,
          description: editingDescription
        })
        .eq('id', editingMissionId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Mission updated successfully"
      });
      
      // Refresh the mission list
      refetch();
    } catch (err) {
      console.error("Error updating mission:", err);
      toast({
        title: "Error",
        description: "Failed to update mission",
        variant: "destructive"
      });
    }
    
    setEditingMissionId(null);
  };

  const handleCreateMission = () => {
    // This would trigger the existing create mission modal
    setShowCreateModal(true);
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
          {fullView && (
            <Button 
              onClick={handleCreateMission} 
              className="bg-neon-aqua/20 hover:bg-neon-aqua/30 text-neon-aqua hover:shadow-[0_0_8px_rgba(0,247,239,0.3)]"
            >
              <Plus className="mr-1 h-4 w-4" />
              Create Mission
            </Button>
          )}
        </div>
      )}

      {tickets && tickets.length > 0 ? (
        <div className="space-y-2">
          {tickets.slice(0, compact && !fullView ? 3 : undefined).map((ticket: Ticket) => (
            <Collapsible
              key={ticket.id}
              open={expandedMission[ticket.id]}
              onOpenChange={() => toggleMissionExpand(ticket.id)}
            >
              <div className="relative">
                <motion.div
                  className={`p-3 border border-[#3A4D62] rounded-md transition-all cursor-pointer ${
                    compact ? 'bg-[#1C2A3A]/60 hover:bg-[#25384D]' : 'bg-[#1C2A3A] hover:shadow-[0_0_10px_rgba(0,247,239,0.2)]'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-start">
                    <div className="flex items-center mr-2 cursor-move text-[#64748B] hover:text-[#CBD5E1]">
                      <GripVertical size={16} className="opacity-60" />
                    </div>
                    
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-0 h-6 w-6 mr-2 text-[#64748B] hover:text-[#F1F5F9] hover:bg-transparent"
                      >
                        {expandedMission[ticket.id] ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    
                    <div className="flex-1" onClick={() => !editingMissionId && handleMissionClick(ticket.id)}>
                      {editingMissionId === ticket.id ? (
                        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                          <Input
                            ref={titleInputRef}
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="mb-1 py-1 h-7 bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9]"
                          />
                          <Textarea
                            ref={descriptionInputRef}
                            value={editingDescription}
                            onChange={(e) => setEditingDescription(e.target.value)}
                            placeholder="Add a description..."
                            className="min-h-[60px] resize-none bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9] text-sm"
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs border-[#3A4D62] text-[#F1F5F9]"
                              onClick={() => setEditingMissionId(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 text-xs"
                              onClick={saveMissionChanges}
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h4 className="text-sm font-medium text-[#F1F5F9]">{ticket.title}</h4>
                          {ticket.description && (
                            <p className="text-xs text-[#CBD5E1] mt-1 line-clamp-2">{ticket.description}</p>
                          )}
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-[#CBD5E1]">{ticket.date}</span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {editingMissionId !== ticket.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditMission(ticket);
                        }}
                        className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#3A4D62]/30"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>

                <CollapsibleContent className="pl-6 mt-2 space-y-2 overflow-hidden">
                  <div 
                    className="border-l-2 border-[#3A4D62] pl-3 rounded-l-sm cursor-pointer"
                    onClick={() => handleMissionClick(ticket.id)}
                  >
                    <p className="text-xs text-[#CBD5E1] hover:text-neon-aqua transition-colors">
                      View and manage tasks for this mission
                    </p>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>
      ) : (
        <p className="text-center py-4 text-sm text-[#CBD5E1]">No recent missions found</p>
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
      
      {/* Mission Create Modal would go here - we're not implementing the full modal since we'd use existing ones */}
    </div>
  );
}

// Import the GripVertical icon component since it's not in the imports but used in the code
import { GripVertical } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
