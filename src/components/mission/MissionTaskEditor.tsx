
import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  X, 
  Calendar, 
  Flag, 
  Clock, 
  User, 
  Check,
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Code, 
  Quote,
  Heading1,
  Heading2,
  Heading3,
  CheckCheck,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useMissionTasks } from '@/hooks/useMissionTasks';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface MissionTaskEditorProps {
  taskId: string;
  onClose: () => void;
  onRefresh: () => void;
}

export function MissionTaskEditor({ taskId, onClose, onRefresh }: MissionTaskEditorProps) {
  const { toast } = useToast();
  const { 
    tasks, 
    subtasks,
    getTaskById,
    updateTaskTitle,
    updateTaskDescription,
    updateTaskStatus,
    updateTaskDueDate,
    updateTaskPriority,
    createTask,
    getSubtasks,
    isLoading,
    refetch
  } = useMissionTasks(taskId);
  
  const task = getTaskById(taskId);
  
  const [title, setTitle] = useState(task?.title || '');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [date, setDate] = useState<Date | undefined>(
    task?.due_date ? new Date(task.due_date) : undefined
  );
  const [priority, setPriority] = useState<string>(task?.priority || 'medium');
  const [status, setStatus] = useState<string>(task?.status || 'open');
  
  // Get current project tasks for navigation
  const currentProjectId = task?.parent_task_id || null;
  const projectTasks = tasks.filter(t => t.parent_task_id === currentProjectId && t.id !== currentProjectId);
  const currentTaskIndex = projectTasks.findIndex(t => t.id === taskId);
  const hasPreviousTask = currentTaskIndex > 0;
  const hasNextTask = currentTaskIndex < projectTasks.length - 1 && currentTaskIndex !== -1;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Write something...',
      }),
    ],
    content: task?.description || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      updateTaskDescription(taskId, html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[200px]',
      }
    }
  });

  useEffect(() => {
    if (taskId) {
      refetch();
      getSubtasks(taskId);
    }
  }, [taskId, refetch, getSubtasks]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDate(task.due_date ? new Date(task.due_date) : undefined);
      setPriority(task.priority || 'medium');
      setStatus(task.status || 'open');
      
      if (editor && task.description) {
        editor.commands.setContent(task.description);
      }
    }
  }, [task, editor]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    if (title.trim() && title !== task?.title) {
      updateTaskTitle(taskId, title);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  const handleDueDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    const formattedDate = newDate ? newDate.toISOString() : null;
    updateTaskDueDate(taskId, formattedDate);
    
    toast({
      title: "Date updated",
      description: newDate ? `Due date set to ${format(newDate, 'MMM d, yyyy')}` : "Due date removed"
    });
  };

  const handlePriorityChange = (newPriority: string) => {
    setPriority(newPriority);
    updateTaskPriority(taskId, newPriority);
    toast({
      title: "Priority updated",
      description: `Task priority set to ${newPriority.charAt(0).toUpperCase() + newPriority.slice(1)}`
    });
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    updateTaskStatus(taskId, newStatus);
    toast({
      title: "Status updated",
      description: `Task status set to ${getStatusLabel(newStatus)}`
    });
  };

  const handleCreateSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    
    createTask(newSubtaskTitle.trim(), taskId);
    setNewSubtaskTitle('');
  };
  
  const navigateToTask = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && hasPreviousTask) {
      const prevTask = projectTasks[currentTaskIndex - 1];
      if (prevTask) {
        // Navigate to the previous task
        refetch().then(() => getSubtasks(prevTask.id));
        return prevTask.id;
      }
    } else if (direction === 'next' && hasNextTask) {
      const nextTask = projectTasks[currentTaskIndex + 1];
      if (nextTask) {
        // Navigate to the next task
        refetch().then(() => getSubtasks(nextTask.id));
        return nextTask.id;
      }
    }
    return null;
  };

  // Priority configuration
  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-neon-aqua/20 text-neon-aqua border-neon-aqua/30' },
    { value: 'medium', label: 'Medium', color: 'bg-amber-500/20 text-amber-500 border-amber-500/30' },
    { value: 'high', label: 'High', color: 'bg-neon-red/20 text-neon-red border-neon-red/30' },
    { value: 'urgent', label: 'Urgent', color: 'bg-neon-red/40 text-neon-red border-neon-red/50' },
  ];

  // Status options
  const statusOptions = [
    { value: 'open', label: 'Open', color: 'bg-[#3A4D62] text-[#F1F5F9] border-[#3A4D62]/50' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-neon-blue/20 text-neon-blue border-neon-blue/30' },
    { value: 'resolved', label: 'Resolved', color: 'bg-amber-500/20 text-amber-500 border-amber-500/30' },
    { value: 'completed', label: 'Completed', color: 'bg-neon-green/20 text-neon-green border-neon-green/30' },
    { value: 'closed', label: 'Closed', color: 'bg-neon-purple/20 text-neon-purple border-neon-purple/30' },
  ];

  const getPriorityColor = (priorityValue: string) => {
    const option = priorityOptions.find(opt => opt.value === priorityValue);
    return option?.color || priorityOptions[1].color;
  };
  
  const getStatusColor = (statusValue: string) => {
    const option = statusOptions.find(opt => opt.value === statusValue);
    return option?.color || statusOptions[0].color;
  };
  
  const getStatusLabel = (statusValue: string) => {
    const option = statusOptions.find(opt => opt.value === statusValue);
    return option?.label || 'Open';
  };

  if (isLoading || !task) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="h-8 w-8 rounded-full border-2 border-t-transparent border-neon-aqua animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[80vh] overflow-hidden">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-3">
          <Checkbox 
            checked={task.status === 'completed'} 
            onCheckedChange={() => handleStatusChange(task.status === 'completed' ? 'open' : 'completed')}
            className="rounded-full h-5 w-5"
          />
          <Input 
            value={title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleKeyDown}
            className="text-xl font-semibold border-none focus-visible:ring-1 focus-visible:ring-neon-aqua bg-transparent px-0"
          />
        </div>
        
        <div className="flex items-center">
          {/* Task Navigation */}
          <div className="flex items-center mr-2 gap-1">
            <Button
              variant="ghost"
              size="icon"
              disabled={!hasPreviousTask}
              onClick={() => {
                const prevTaskId = navigateToTask('prev');
                if (prevTaskId) {
                  window.history.replaceState({}, '', `/projects/${currentProjectId}/tasks/${prevTaskId}`);
                }
              }}
              className={`h-8 w-8 rounded-full ${!hasPreviousTask ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#3A4D62]/30'}`}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={!hasNextTask}
              onClick={() => {
                const nextTaskId = navigateToTask('next');
                if (nextTaskId) {
                  window.history.replaceState({}, '', `/projects/${currentProjectId}/tasks/${nextTaskId}`);
                }
              }}
              className={`h-8 w-8 rounded-full ${!hasNextTask ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#3A4D62]/30'}`}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#3A4D62]/30"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Properties */}
      <div className="flex items-center gap-4 px-4 py-2">
        {/* Status Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Badge className={`px-2 py-0.5 cursor-pointer hover:opacity-90 ${getStatusColor(status)}`}>
              {getStatusLabel(status)}
            </Badge>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#25384D] border-[#3A4D62] text-[#F1F5F9] z-50">
            <DropdownMenuLabel>Set Status</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#3A4D62]" />
            {statusOptions.map((option) => {
              const isActive = status === option.value;
              return (
                <DropdownMenuItem 
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)} 
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
        
        <Popover>
          <PopoverTrigger asChild>
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
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-[#3A4D62] hover:border-[#64748B] hover:bg-[#3A4D62]/30"
            >
              <Flag className={`mr-2 h-4 w-4 ${
                priority === 'high' ? 'text-neon-red' :
                priority === 'urgent' ? 'text-neon-red' :
                priority === 'medium' ? 'text-amber-500' :
                'text-[#64748B]'
              }`} />
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#25384D] border-[#3A4D62] text-[#F1F5F9] z-50">
            <DropdownMenuLabel>Set Priority</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#3A4D62]" />
            {priorityOptions.map((option) => {
              const isActive = priority === option.value;
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
      </div>
      
      <Separator className="my-2 bg-[#3A4D62]/50" />
      
      {/* Editor Toolbar */}
      <div className="flex items-center gap-1 px-4 py-1 bg-[#1C2A3A]">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 text-[#CBD5E1] hover:bg-[#3A4D62]/50"
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 text-[#CBD5E1] hover:bg-[#3A4D62]/50"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 text-[#CBD5E1] hover:bg-[#3A4D62]/50"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 text-[#CBD5E1] hover:bg-[#3A4D62]/50"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 text-[#CBD5E1] hover:bg-[#3A4D62]/50"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 text-[#CBD5E1] hover:bg-[#3A4D62]/50"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 text-[#CBD5E1] hover:bg-[#3A4D62]/50"
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 text-[#CBD5E1] hover:bg-[#3A4D62]/50"
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Rich Text Editor */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <EditorContent editor={editor} className="min-h-[200px]" />
        
        {/* Subtasks Section */}
        <div className="mt-6 space-y-3">
          <h3 className="font-medium text-[#F1F5F9] flex items-center gap-2">
            <Check className="h-4 w-4 text-neon-green" />
            Subtasks
          </h3>
          
          <div className="space-y-2">
            {subtasks[taskId]?.length > 0 ? (
              subtasks[taskId].map((subtask) => (
                <div 
                  key={subtask.id}
                  className="flex items-center gap-2 p-2 rounded hover:bg-[#1C2A3A] group"
                >
                  <Checkbox 
                    checked={subtask.status === 'completed'}
                    onCheckedChange={() => updateTaskStatus(subtask.id, subtask.status === 'completed' ? 'open' : 'completed')}
                    className="rounded-full"
                  />
                  <span className={cn(
                    "flex-1",
                    subtask.status === 'completed' ? 'text-[#64748B] line-through' : 'text-[#F1F5F9]'
                  )}>
                    {subtask.title}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-[#64748B] text-sm italic">No subtasks yet</div>
            )}
            
            <div className="flex items-center gap-2 mt-2">
              <Input
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Add a subtask..."
                className="flex-1 bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateSubtask();
                  }
                }}
              />
              <Button 
                onClick={handleCreateSubtask}
                className="bg-neon-aqua hover:bg-neon-aqua/90 text-black"
                disabled={!newSubtaskTitle.trim()}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
        
        {/* Placeholder for future features */}
        <div className="mt-8">
          <h3 className="font-medium text-[#64748B] mb-2">Attachments</h3>
          <div className="p-4 border border-dashed border-[#3A4D62] rounded-md text-center">
            <p className="text-sm text-[#64748B]">
              Attachment support coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
