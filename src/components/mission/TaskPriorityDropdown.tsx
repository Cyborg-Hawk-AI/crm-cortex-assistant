
import { useState } from 'react';
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

interface PriorityOption {
  value: string;
  label: string;
  color: string;
}

interface TaskPriorityDropdownProps {
  currentPriority: string;
  onChange: (priority: string) => void;
}

export function TaskPriorityDropdown({ currentPriority, onChange }: TaskPriorityDropdownProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

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

  const handlePriorityChange = async (newPriority: string) => {
    setIsUpdating(true);
    try {
      await onChange(newPriority);
      toast({
        title: "Priority updated",
        description: `Task priority set to ${newPriority.charAt(0).toUpperCase() + newPriority.slice(1)}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update priority",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={isUpdating}>
        <Button
          variant="outline"
          size="sm"
          className="border-[#3A4D62] hover:border-[#64748B] hover:bg-[#3A4D62]/30"
        >
          <Flag className={`mr-2 h-4 w-4 ${getFlagColor(currentPriority)}`} />
          {currentPriority.charAt(0).toUpperCase() + currentPriority.slice(1)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#25384D] border-[#3A4D62] text-[#F1F5F9] z-50">
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
              onClick={() => handlePriorityChange(option.value)} 
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
