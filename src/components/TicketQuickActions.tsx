
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, ClipboardCheck, MessageSquareText, History, 
  BadgeCheck, CheckSquare, MoreHorizontal, FileSpreadsheet,
  RefreshCw, Send, Timer, UserPlus, Link, FileCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { TicketAction } from '@/utils/types';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export function TicketQuickActions() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Track window resize for responsive adjustments
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const ticketActions: TicketAction[] = [
    {
      id: 'reply',
      label: 'Reply',
      description: 'Send a response to the customer',
      action: () => {
        toast({
          title: "Reply function triggered",
          description: "Opening reply composer for this ticket"
        });
      },
      icon: <MessageSquareText className="h-4 w-4" />
    },
    {
      id: 'summarize',
      label: 'Summarize',
      description: 'Generate an AI summary of this ticket',
      action: () => {
        toast({
          title: "Summarize function triggered",
          description: "Generating AI summary for this ticket"
        });
      },
      icon: <ClipboardCheck className="h-4 w-4" />
    },
    {
      id: 'status',
      label: 'Status',
      description: 'Change the status of this ticket',
      action: () => {
        toast({
          title: "Status update triggered",
          description: "Opening status selector for this ticket"
        });
      },
      icon: <BadgeCheck className="h-4 w-4" />
    },
    {
      id: 'history',
      label: 'History',
      description: 'See the complete ticket history',
      action: () => {
        toast({
          title: "History function triggered",
          description: "Loading full ticket history"
        });
      },
      icon: <History className="h-4 w-4" />
    },
    {
      id: 'notify',
      label: 'Notify',
      description: 'Send notifications about this ticket',
      action: () => {
        toast({
          title: "Notify function triggered",
          description: "Opening notification options"
        });
      },
      icon: <Bell className="h-4 w-4" />
    },
    {
      id: 'resolve',
      label: 'Resolve',
      description: 'Mark this ticket as resolved',
      action: () => {
        toast({
          title: "Resolve function triggered",
          description: "Marking ticket as resolved"
        });
      },
      icon: <CheckSquare className="h-4 w-4" />
    },
    {
      id: 'assign',
      label: 'Assign',
      description: 'Assign this ticket to a team member',
      action: () => {
        toast({
          title: "Assign function triggered",
          description: "Opening assignment dialog"
        });
      },
      icon: <UserPlus className="h-4 w-4" />
    },
    {
      id: 'sla',
      label: 'SLA Status',
      description: 'Check Service Level Agreement status',
      action: () => {
        toast({
          title: "SLA function triggered",
          description: "Checking SLA status for this ticket"
        });
      },
      icon: <Timer className="h-4 w-4" />
    },
    {
      id: 'escalate',
      label: 'Escalate',
      description: 'Escalate this ticket to higher tier support',
      action: () => {
        toast({
          title: "Escalate function triggered",
          description: "Opening escalation options"
        });
      },
      icon: <Send className="h-4 w-4" />
    },
    {
      id: 'export',
      label: 'Export',
      description: 'Export this ticket data',
      action: () => {
        toast({
          title: "Export function triggered",
          description: "Preparing ticket data for export"
        });
      },
      icon: <FileSpreadsheet className="h-4 w-4" />
    },
    {
      id: 'link',
      label: 'Link',
      description: 'Link this ticket to related issues',
      action: () => {
        toast({
          title: "Link function triggered",
          description: "Opening ticket linking interface"
        });
      },
      icon: <Link className="h-4 w-4" />
    },
    {
      id: 'checklist',
      label: 'Checklist',
      description: 'View resolution checklist',
      action: () => {
        toast({
          title: "Checklist function triggered",
          description: "Opening resolution checklist"
        });
      },
      icon: <FileCheck className="h-4 w-4" />
    }
  ];

  // More varied color classes for each action using our color scheme
  const actionColors: Record<string, string> = {
    'reply': 'bg-teal-green/90 text-white',
    'summarize': 'bg-aqua-tint/90 text-white',
    'status': 'bg-primary/90 text-white',
    'history': 'bg-warm-sand/90 text-foreground',
    'notify': 'bg-deep-taupe/20 text-foreground',
    'resolve': 'bg-teal-green/90 text-white',
    'more': 'bg-medium-gray/30 text-foreground'
  };

  // Determine how many actions to show based on screen width
  const getVisibleActionCount = () => {
    if (windowWidth < 480) return 3; // Very small screens
    if (windowWidth < 640) return 4; // Small screens
    if (windowWidth < 768) return 5; // Medium screens
    return 5; // Large screens
  };

  const visibleActionCount = getVisibleActionCount();
  const gridCols = `grid-cols-${Math.min(visibleActionCount, 5)}`;

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-medium text-primary">Ticket Actions</h4>
      <div className={`grid ${isMobile ? 'grid-cols-3' : gridCols} gap-2`}>
        {ticketActions.slice(0, visibleActionCount).map((action) => (
          <ActionButton 
            key={action.id} 
            action={action} 
            colorClass={actionColors[action.id] || 'bg-secondary text-foreground'}
          />
        ))}
        
        {/* More dropdown that changes based on screen size */}
        {ticketActions.length > visibleActionCount && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div
                whileHover={{ y: -3, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`h-12 w-12 rounded-full flex items-center justify-center shadow-sm border-0 hover:shadow-md ${actionColors.more || 'bg-medium-gray/30 text-foreground'}`}
                  title="More Actions"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-auto p-2 bg-card backdrop-blur-sm border border-border/30"
            >
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-1 p-1`}>
                {ticketActions.slice(visibleActionCount).map((action) => (
                  <Button 
                    key={action.id}
                    variant="ghost" 
                    size="sm" 
                    onClick={action.action}
                    className="justify-start text-xs h-8 text-foreground hover:bg-primary/10"
                    title={action.description}
                  >
                    {action.icon}
                    <span className="ml-2">{action.label}</span>
                  </Button>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

function ActionButton({ action, colorClass }: { action: TicketAction; colorClass: string }) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <motion.div
          whileHover={{ y: -3, scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Button 
            variant="outline" 
            size="sm" 
            onClick={action.action}
            className={`h-12 w-12 rounded-full flex items-center justify-center shadow-sm border-0 hover:shadow-md ${colorClass}`}
            title={action.label}
          >
            {action.icon}
          </Button>
        </motion.div>
      </HoverCardTrigger>
      <HoverCardContent className="p-2 text-center bg-card border border-border/30">
        <span className="text-xs">{action.label}</span>
      </HoverCardContent>
    </HoverCard>
  );
}
