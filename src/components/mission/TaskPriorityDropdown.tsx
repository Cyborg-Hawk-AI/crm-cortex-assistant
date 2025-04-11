
import { useState, useEffect } from 'react';
import { Flag, CheckCheck } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { getPriorityDisplayInfo } from '@/utils/taskHelpers';

interface PriorityOption {
  value: string;
  label: string;
  color: string;
}

interface TaskPriorityDropdownProps {
  currentPriority: string;
  onChange: (priority: string) => void;
  displayAsBadge?: boolean;
}

export function TaskPriorityDropdown({ 
  currentPriority, 
  onChange,
  displayAsBadge = false
}: TaskPriorityDropdownProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  console.log('[DEBUG-TaskPriorityDropdown] Component rendered with priority:', currentPriority);
  console.log('[DEBUG-TaskPriorityDropdown] Current isOpen state:', isOpen);
  console.log('[DEBUG-TaskPriorityDropdown] displayAsBadge:', displayAsBadge);

  // Priority configuration
  const priorityOptions: PriorityOption[] = [
    { value: 'low', label: 'Low', color: 'bg-neon-aqua/20 text-neon-aqua border-neon-aqua/30' },
    { value: 'medium', label: 'Medium', color: 'bg-amber-500/20 text-amber-500 border-amber-500/30' },
    { value: 'high', label: 'High', color: 'bg-neon-red/20 text-neon-red border-neon-red/30' },
    { value: 'urgent', label: 'Urgent', color: 'bg-neon-red/40 text-neon-red border-neon-red/50' },
  ];
  
  const getPriorityColor = (priorityValue: string) => {
    const option = priorityOptions.find(opt => opt.value === priorityValue);
    return option?.color || priorityOptions[1].color;
  };

  const getFlagColor = (priority: string) => {
    if (priority === 'high' || priority === 'urgent') return 'text-neon-red';
    if (priority === 'medium') return 'text-amber-500';
    return 'text-neon-blue';
  };

  useEffect(() => {
    console.log('[DEBUG-TaskPriorityDropdown] Dropdown open state changed to:', isOpen);
  }, [isOpen]);

  const handlePriorityChange = async (newPriority: string) => {
    console.log(`[DEBUG-TaskPriorityDropdown] Priority change requested: ${currentPriority} -> ${newPriority}`);
    setIsUpdating(true);
    try {
      console.log(`[DEBUG-TaskPriorityDropdown] Before calling onChange handler`);
      await onChange(newPriority);
      console.log(`[DEBUG-TaskPriorityDropdown] After calling onChange handler, update successful`);
      
      toast({
        title: "Priority updated",
        description: `Task priority set to ${newPriority.charAt(0).toUpperCase() + newPriority.slice(1)}`
      });
    } catch (error) {
      console.error(`[DEBUG-TaskPriorityDropdown] Error updating priority:`, error);
      
      toast({
        title: "Error",
        description: "Failed to update priority",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
      setIsOpen(false);
      console.log('[DEBUG-TaskPriorityDropdown] Update process completed, dropdown closed');
    }
  };

  const TriggerComponent = displayAsBadge ? (
    <Badge 
      className={`px-2 py-0.5 cursor-pointer hover:opacity-90 ${getPriorityColor(currentPriority)} flex items-center gap-1`}
      onClick={(e) => {
        console.log('[DEBUG-TaskPriorityDropdown] Badge trigger clicked');
        e.stopPropagation();
      }}
    >
      <Flag className={`h-3.5 w-3.5 ${getFlagColor(currentPriority)}`} aria-hidden="true" />
      {currentPriority.charAt(0).toUpperCase() + currentPriority.slice(1)}
    </Badge>
  ) : (
    <Button
      variant="outline"
      size="sm"
      className="border-[#3A4D62] hover:border-[#64748B] hover:bg-[#3A4D62]/30"
      onClick={(e) => {
        console.log('[DEBUG-TaskPriorityDropdown] Button trigger clicked');
        e.stopPropagation();
      }}
    >
      <Flag className={`mr-2 h-4 w-4 ${getFlagColor(currentPriority)}`} />
      {currentPriority.charAt(0).toUpperCase() + currentPriority.slice(1)}
    </Button>
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={(open) => {
      console.log('[DEBUG-TaskPriorityDropdown] onOpenChange triggered with:', open);
      setIsOpen(open);
    }}>
      <DropdownMenuTrigger asChild disabled={isUpdating}>
        {TriggerComponent}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="bg-[#25384D] border-[#3A4D62] text-[#F1F5F9] z-50"
        onCloseAutoFocus={(e) => {
          console.log('[DEBUG-TaskPriorityDropdown] Dropdown closing with autoFocus event');
          e.preventDefault();
        }}
      >
        <DropdownMenuLabel>Set Priority</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#3A4D62]" />
        {priorityOptions.map((option) => {
          const isActive = currentPriority === option.value;
          let iconColor = 'text-[#64748B]';
          
          if (option.value === 'high' || option.value === 'urgent') {
            iconColor = isActive ? 'text-neon-aqua' : 'text-neon-red';
          } else if (option.value === 'medium') {
            iconColor = isActive ? 'text-neon-aqua' : 'text-amber-500';
          } else {
            iconColor = isActive ? 'text-neon-aqua' : 'text-neon-blue';
          }
          
          return (
            <DropdownMenuItem 
              key={option.value}
              onClick={() => {
                console.log(`[DEBUG-TaskPriorityDropdown] Option clicked: ${option.value}`);
                handlePriorityChange(option.value);
              }} 
              className="hover:bg-[#3A4D62]/50 cursor-pointer flex items-center gap-2"
            >
              <Flag className={`h-4 w-4 ${iconColor}`} aria-hidden="true" />
              <span className={isActive ? 'text-neon-aqua' : ''}>{option.label}</span>
              {isActive && <CheckCheck className="h-4 w-4 ml-auto text-neon-aqua" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
