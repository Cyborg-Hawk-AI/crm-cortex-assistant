
import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface TaskDueDatePickerProps {
  date: Date | undefined;
  onChange: (date: Date | null) => void;
}

export function TaskDueDatePicker({ date, onChange }: TaskDueDatePickerProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleDueDateChange = async (newDate: Date | undefined) => {
    setIsUpdating(true);
    try {
      await onChange(newDate || null);
      
      toast({
        title: "Date updated",
        description: newDate 
          ? `Due date set to ${format(newDate, 'MMM d, yyyy')}` 
          : "Due date removed"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update due date",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild disabled={isUpdating}>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "justify-start text-left font-normal border-[#3A4D62] hover:border-[#64748B] hover:bg-[#3A4D62]/30",
            !date && "text-[#64748B]"
          )}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {date ? format(date, 'MMM d, yyyy') : <span>Due date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-[#25384D] border-[#3A4D62] z-50">
        <CalendarComponent
          mode="single"
          selected={date}
          onSelect={handleDueDateChange}
          initialFocus
          className="bg-[#25384D] text-[#F1F5F9]"
        />
      </PopoverContent>
    </Popover>
  );
}
