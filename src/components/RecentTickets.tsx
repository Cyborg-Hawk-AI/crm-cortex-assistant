
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TicketInfo } from '@/components/TicketInfo';
import { TicketQuickActions } from '@/components/TicketQuickActions';
import { PlusCircle, BarChart2, Layers } from 'lucide-react';
import { Ticket } from '@/utils/types';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

interface RecentTicketsProps {
  fullView?: boolean; 
  onTaskClick?: (taskId: string) => void;
}

export function RecentTickets({ fullView = false, onTaskClick }: RecentTicketsProps) {
  const navigate = useNavigate();
  
  // Use React Query to fetch the most recently updated tasks
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['recent-mission-tasks'],
    queryFn: async () => {
      try {
        // Fetch tasks ordered by updated_at in descending order
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(fullView ? 6 : 3);

        if (error) {
          console.error('Error fetching recent mission tasks:', error);
          return [];
        }

        // Transform the data to match the Ticket interface
        return data.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status || 'Open',
          priority: task.priority || 'Medium',
          created_at: new Date(task.created_at),
          updated_at: new Date(task.updated_at),
          customer: { name: task.assignee_id || 'Unassigned' },
          parent_task_id: task.parent_task_id,
          summary: task.description?.substring(0, 100) + (task.description?.length > 100 ? '...' : ''),
          tags: task.tags || [],
          created_by: task.reporter_id || 'Unknown',
          user_id: task.user_id || 'Unknown',
          reporter_id: task.reporter_id || 'Unknown',
          assignee_id: task.assignee_id
        }));
      } catch (error) {
        console.error('Failed to fetch recent tickets:', error);
        return [];
      }
    },
    refetchInterval: 60000 // Refetch every minute
  });

  // Stats for the dashboard view
  const { 
    data: taskStats = { open: 0, inProgress: 0, completed: 0 },
    isLoading: isLoadingStats
  } = useQuery({
    queryKey: ['task-stats'],
    queryFn: async () => {
      try {
        const { data: openTasks, error: openError } = await supabase
          .from('tasks')
          .select('count')
          .eq('status', 'open');

        const { data: inProgressTasks, error: inProgressError } = await supabase
          .from('tasks')
          .select('count')
          .eq('status', 'in-progress');

        const { data: completedTasks, error: completedError } = await supabase
          .from('tasks')
          .select('count')
          .eq('status', 'completed');

        if (openError || inProgressError || completedError) {
          console.error('Error fetching task stats:', openError || inProgressError || completedError);
          return { open: 0, inProgress: 0, completed: 0 };
        }

        return {
          open: openTasks[0]?.count || 0,
          inProgress: inProgressTasks[0]?.count || 0,
          completed: completedTasks[0]?.count || 0
        };
      } catch (error) {
        console.error('Failed to fetch task stats:', error);
        return { open: 0, inProgress: 0, completed: 0 };
      }
    }
  });
  
  const handleOpenChat = () => {
    console.log("Open chat");
    // Implementation would go here
  };
  
  const handleOpenScratchpad = () => {
    console.log("Open scratchpad");
    // Implementation would go here
  };
  
  const handleViewAll = () => {
    navigate('/', { state: { activeTab: 'tasks' } });
  };
  
  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <div className="flex items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-neon-red to-neon-purple mr-2"></div>
          <CardTitle className="text-lg font-bold">Recent Missions</CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          {!fullView && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sm px-2 text-[#CBD5E1] hover:text-[#F1F5F9]"
              onClick={handleViewAll}
            >
              View all
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="border-neon-purple/40 hover:border-neon-purple/70 hover:bg-neon-purple/10 text-sm"
            onClick={() => navigate('/', { state: { activeTab: 'tasks', openCreateTask: true } })}
          >
            <PlusCircle className="h-3.5 w-3.5 mr-1" />
            New
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse bg-gray-700/50 h-32 w-full rounded-md"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No mission tasks found</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4 border-neon-purple/40 hover:border-neon-purple/70 hover:bg-neon-purple/10"
              onClick={() => navigate('/', { state: { activeTab: 'tasks', openCreateTask: true } })}
            >
              Create your first mission
            </Button>
          </div>
        ) : fullView ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="flex flex-col" onClick={() => onTaskClick && onTaskClick(ticket.id)}>
                <TicketInfo 
                  ticket={ticket} 
                  onOpenChat={handleOpenChat}
                  onOpenScratchpad={handleOpenScratchpad}
                />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {tickets.slice(0, 3).map((ticket) => (
                <div key={ticket.id} onClick={() => onTaskClick && onTaskClick(ticket.id)}>
                  <TicketInfo 
                    ticket={ticket}
                    onOpenChat={handleOpenChat}
                    onOpenScratchpad={handleOpenScratchpad}
                  />
                </div>
              ))}
            </div>
            
            {/* Summary Statistics */}
            <div className="mt-6 grid grid-cols-3 gap-2">
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-md p-3 flex items-center">
                <div className="rounded-full bg-neon-purple/20 w-8 h-8 flex items-center justify-center mr-3">
                  <Layers className="h-4 w-4 text-neon-purple" />
                </div>
                <div>
                  <div className="text-xs text-[#CBD5E1]">Open</div>
                  <div className="text-lg font-bold">{isLoadingStats ? '...' : taskStats.open}</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-md p-3 flex items-center">
                <div className="rounded-full bg-neon-blue/20 w-8 h-8 flex items-center justify-center mr-3">
                  <BarChart2 className="h-4 w-4 text-neon-blue" />
                </div>
                <div>
                  <div className="text-xs text-[#CBD5E1]">In Progress</div>
                  <div className="text-lg font-bold">{isLoadingStats ? '...' : taskStats.inProgress}</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-md p-3 flex items-center">
                <div className="rounded-full bg-neon-green/20 w-8 h-8 flex items-center justify-center mr-3">
                  <BarChart2 className="h-4 w-4 text-neon-green" />
                </div>
                <div>
                  <div className="text-xs text-[#CBD5E1]">Completed</div>
                  <div className="text-lg font-bold">{isLoadingStats ? '...' : taskStats.completed}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
