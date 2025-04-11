
import { useState } from 'react';
import { CheckCheck } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface StatusOption {
  value: string;
  label: string;
  color: string;
}

interface TaskStatusDropdownProps {
  currentStatus: string;
  onChange: (status: string) => void;
}

export function TaskStatusDropdown({ currentStatus, onChange }: TaskStatusDropdownProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  console.log("[TaskStatusDropdown] Rendering with status:", currentStatus);

  // Status options
  const statusOptions: StatusOption[] = [
    { value: 'open', label: 'Open', color: 'bg-[#3A4D62] text-[#F1F5F9] border-[#3A4D62]/50' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-neon-blue/20 text-neon-blue border-neon-blue/30' },
    { value: 'resolved', label: 'Resolved', color: 'bg-amber-500/20 text-amber-500 border-amber-500/30' },
    { value: 'completed', label: 'Completed', color: 'bg-neon-green/20 text-neon-green border-neon-green/30' },
    { value: 'closed', label: 'Closed', color: 'bg-neon-purple/20 text-neon-purple border-neon-purple/30' },
  ];
  
  const getStatusColor = (statusValue: string) => {
    const option = statusOptions.find(opt => opt.value === statusValue);
    return option?.color || statusOptions[0].color;
  };
  
  const getStatusLabel = (statusValue: string) => {
    const option = statusOptions.find(opt => opt.value === statusValue);
    return option?.label || 'Open';
  };

  const handleStatusChange = async (newStatus: string) => {
    console.log("[TaskStatusDropdown] Status change requested:", newStatus);
    setIsUpdating(true);
    setIsOpen(false);
    try {
      await onChange(newStatus);
      toast({
        title: "Status updated",
        description: `Task status set to ${getStatusLabel(newStatus)}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  console.log("[TaskStatusDropdown] Current open state:", isOpen);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild disabled={isUpdating}>
        <Badge 
          className={`px-2 py-0.5 cursor-pointer hover:opacity-90 ${getStatusColor(currentStatus)}`}
          onClick={() => {
            console.log("[TaskStatusDropdown] Badge clicked, toggling dropdown");
            setIsOpen(!isOpen);
          }}
        >
          {getStatusLabel(currentStatus)}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="z-[999]">
        <DropdownMenuLabel>Set Status</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#3A4D62]" />
        {statusOptions.map((option) => {
          const isActive = currentStatus === option.value;
          return (
            <DropdownMenuItem 
              key={option.value}
              onClick={() => {
                console.log("[TaskStatusDropdown] Option clicked:", option.value);
                handleStatusChange(option.value);
              }} 
              className="hover:bg-[#3A4D62]/50 cursor-pointer flex items-center gap-2"
            >
              <div className={`w-2 h-2 rounded-full ${
                option.value === 'completed' ? 'bg-neon-green' : 
                option.value === 'in-progress' ? 'bg-neon-blue' : 
                option.value === 'closed' ? 'bg-neon-purple' : 
                option.value === 'resolved' ? 'bg-amber-500' : 'bg-[#64748B]'
              }`}></div>
              <span className={isActive ? 'text-neon-aqua' : ''}>{option.label}</span>
              {isActive && <CheckCheck className="h-4 w-4 ml-auto text-neon-aqua" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
