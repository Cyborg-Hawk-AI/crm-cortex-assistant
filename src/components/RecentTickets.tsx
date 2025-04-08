
import React from 'react';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TicketInfo } from '@/components/TicketInfo';
import { TicketQuickActions } from '@/components/TicketQuickActions';
import { PlusCircle, BarChart2, Layers } from 'lucide-react';
import { Ticket } from '@/utils/types';

// This is a mock implementation that simulates data
const tickets: Ticket[] = [
  {
    id: '24b9da97-07c2-41e5-bb4a-254595162af6',
    title: 'Implement dashboard analytics',
    description: 'Create analytics dashboard with key performance metrics',
    status: 'in-progress',
    priority: 'high',
    created_at: new Date('2025-03-29T08:00:00'),
    updated_at: new Date('2025-04-07T11:30:00'),
    customer: { name: 'Alex Chen', company: 'TechCorp Inc.' },
    tags: ['design', 'frontend'],
    summary: 'Working on implementing analytics dashboard with multiple visualization types.',
    actionItems: [
      'Create bar chart component',
      'Implement data filtering',
      'Add export functionality'
    ],
    related: ['e14e7cae-cc7a-4cfb-b0ad-c2202805c786'] // Added related property to link to child task
  },
  {
    id: 'e14e7cae-cc7a-4cfb-b0ad-c2202805c786',
    title: 'API integration issues',
    description: 'Fix authentication problems with external API',
    status: 'open',
    priority: 'urgent',
    created_at: new Date('2025-04-03T15:20:00'),
    updated_at: new Date('2025-04-08T09:45:00'),
    customer: { name: 'Jamie Rivera' },
    tags: ['backend', 'API'],
    summary: 'Users experiencing intermittent connection failures to the main API.',
    actionItems: [
      'Debug authentication flow',
      'Check rate limiting settings',
      'Update documentation'
    ],
    related: ['24b9da97-07c2-41e5-bb4a-254595162af6'] // We'll use this to indicate the parent task
  },
];

interface RecentTicketsProps {
  fullView?: boolean; 
  onTaskClick?: (taskId: string) => void;
}

export function RecentTickets({ fullView = false, onTaskClick }: RecentTicketsProps) {
  const handleOpenChat = () => {
    console.log("Open chat");
    // Implementation would go here
  };
  
  const handleOpenScratchpad = () => {
    console.log("Open scratchpad");
    // Implementation would go here
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
              onClick={() => {
                // Navigate directly to the tasks tab instead of using a URL
                const taskTab = document.querySelector('[data-tab="tasks"]');
                if (taskTab) {
                  (taskTab as HTMLElement).click();
                } else {
                  console.error("Tasks tab not found");
                }
              }}
            >
              View all
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="border-neon-purple/40 hover:border-neon-purple/70 hover:bg-neon-purple/10 text-sm"
          >
            <PlusCircle className="h-3.5 w-3.5 mr-1" />
            New
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {fullView ? (
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
                  <div className="text-lg font-bold">4</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-md p-3 flex items-center">
                <div className="rounded-full bg-neon-blue/20 w-8 h-8 flex items-center justify-center mr-3">
                  <BarChart2 className="h-4 w-4 text-neon-blue" />
                </div>
                <div>
                  <div className="text-xs text-[#CBD5E1]">In Progress</div>
                  <div className="text-lg font-bold">2</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-md p-3 flex items-center">
                <div className="rounded-full bg-neon-green/20 w-8 h-8 flex items-center justify-center mr-3">
                  <BarChart2 className="h-4 w-4 text-neon-green" />
                </div>
                <div>
                  <div className="text-xs text-[#CBD5E1]">Completed</div>
                  <div className="text-lg font-bold">7</div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
