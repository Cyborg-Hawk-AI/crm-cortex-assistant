
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
  Heading3
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
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface MissionTaskEditorProps {
  taskId: string;
  onClose: () => void;
  onRefresh: () => void;
}

export function MissionTaskEditor({ taskId, onClose, onRefresh }: MissionTaskEditorProps) {
  const { 
    tasks, 
    subtasks,
    getTaskById,
    updateTaskTitle,
    updateTaskDescription,
    updateTaskStatus,
    updateTaskDueDate,
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  const handleDueDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    const formattedDate = newDate ? newDate.toISOString() : null;
    updateTaskDueDate(taskId, formattedDate);
  };

  const handlePriorityChange = (newPriority: string) => {
    setPriority(newPriority);
    // Update in backend would go here if there's a updateTaskPriority function
  };

  const handleStatusChange = () => {
    if (task) {
      const newStatus = task.status === 'completed' ? 'open' : 'completed';
      updateTaskStatus(taskId, newStatus);
    }
  };

  const handleCreateSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    
    createTask(newSubtaskTitle.trim(), taskId);
    setNewSubtaskTitle('');
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
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-3">
          <Checkbox 
            checked={task.status === 'completed'} 
            onCheckedChange={handleStatusChange}
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
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onClose}
          className="text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#3A4D62]/30"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Properties */}
      <div className="flex items-center gap-4 px-4 py-2">
        <div className="flex items-center gap-1">
          <Badge className={`px-2 py-0.5 ${
            task.status === 'completed' 
              ? 'bg-neon-green/20 text-neon-green border-neon-green/30' 
              : 'bg-[#3A4D62] text-[#F1F5F9] border-[#3A4D62]/50'
          }`}>
            {task.status === 'completed' ? 'Completed' : 'Open'}
          </Badge>
        </div>
        
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
          <PopoverContent className="w-auto p-0 bg-[#25384D] border-[#3A4D62]">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={handleDueDateChange}
              initialFocus
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
                priority === 'medium' ? 'text-amber-500' :
                'text-[#64748B]'
              }`} />
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#25384D] border-[#3A4D62] text-[#F1F5F9]">
            <DropdownMenuItem 
              onClick={() => handlePriorityChange('low')}
              className="hover:bg-[#3A4D62]/50"
            >
              <Flag className="mr-2 h-4 w-4 text-[#64748B]" />
              Low
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handlePriorityChange('medium')}
              className="hover:bg-[#3A4D62]/50"
            >
              <Flag className="mr-2 h-4 w-4 text-amber-500" />
              Medium
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handlePriorityChange('high')}
              className="hover:bg-[#3A4D62]/50"
            >
              <Flag className="mr-2 h-4 w-4 text-neon-red" />
              High
            </DropdownMenuItem>
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
