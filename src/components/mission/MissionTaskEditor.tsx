import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  X, 
  Calendar, 
  Flag, 
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
  ArrowRight,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useMissionTasks } from '@/hooks/useMissionTasks';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { TaskStatusDropdown } from './TaskStatusDropdown';
import { TaskPriorityDropdown } from './TaskPriorityDropdown';
import { TaskDueDatePicker } from './TaskDueDatePicker';

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
    deleteTask,
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

  const handleCreateSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    
    createTask(newSubtaskTitle.trim(), taskId);
    setNewSubtaskTitle('');
  };
  
  const handleDeleteSubtask = (subtaskId: string) => {
    console.log("Deleting subtask:", subtaskId);
    deleteTask(subtaskId);
    toast({
      title: "Subtask deleted",
      description: "The subtask has been removed",
    });
  };
  
  const handleToggleSubtaskStatus = (subtaskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'open' : 'completed';
    updateTaskStatus(subtaskId, newStatus);
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
            onCheckedChange={() => {
              const newStatus = task.status === 'completed' ? 'open' : 'completed';
              setStatus(newStatus);
              updateTaskStatus(taskId, newStatus);
            }}
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
        <TaskStatusDropdown 
          currentStatus={status} 
          onChange={(newStatus) => {
            setStatus(newStatus);
            return updateTaskStatus(taskId, newStatus);
          }} 
        />
        
        {/* Due Date Picker */}
        <TaskDueDatePicker
          date={date}
          onChange={(newDate) => {
            setDate(newDate || undefined);
            return updateTaskDueDate(taskId, newDate ? newDate.toISOString() : null);
          }}
        />
        
        {/* Priority Dropdown */}
        <TaskPriorityDropdown
          currentPriority={priority}
          onChange={(newPriority) => {
            setPriority(newPriority);
            return updateTaskPriority(taskId, newPriority);
          }}
        />
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
                    onCheckedChange={() => handleToggleSubtaskStatus(subtask.id, subtask.status)}
                    className="rounded-full"
                  />
                  <span className={cn(
                    "flex-1",
                    subtask.status === 'completed' ? 'text-[#64748B] line-through' : 'text-[#F1F5F9]'
                  )}>
                    {subtask.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-[#3A4D62]/50"
                    onClick={() => handleDeleteSubtask(subtask.id)}
                  >
                    <X className="h-3.5 w-3.5 text-[#94A3B8] hover:text-[#E11D48]" />
                  </Button>
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
