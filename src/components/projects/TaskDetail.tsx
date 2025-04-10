
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Edit2, 
  MessageSquare, 
  MoreHorizontal, 
  PlusCircle, 
  Tag, 
  User, 
  X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Task, SubTask } from '@/utils/types';

interface TaskDetailProps {
  task: Task;
  subtasks?: SubTask[];
  onClose: () => void;
  onUpdate?: (task: Task) => void;
}

export function TaskDetail({ task, subtasks = [], onClose, onUpdate }: TaskDetailProps) {
  const [description, setDescription] = useState(task.description || '');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'closed':
      case 'resolved':
        return 'bg-neon-green/20 text-neon-green border-neon-green/30';
      case 'in progress':
      case 'in-progress':
        return 'bg-neon-blue/20 text-neon-blue border-neon-blue/30';
      case 'open':
      case 'backlog':
        return 'bg-neon-purple/20 text-neon-purple border-neon-purple/30';
      default:
        return 'bg-gray-200/20 text-gray-500 border-gray-300/30';
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch(priority.toLowerCase()) {
      case 'high':
      case 'urgent':
        return 'bg-neon-red/20 text-neon-red border-neon-red/30';
      case 'medium':
        return 'bg-neon-yellow/20 text-neon-yellow border-neon-yellow/30';
      case 'low':
        return 'bg-neon-aqua/20 text-neon-aqua border-neon-aqua/30';
      default:
        return 'bg-gray-200/20 text-gray-500 border-gray-300/30';
    }
  };
  
  const handleDescriptionSave = () => {
    setIsEditingDescription(false);
    if (onUpdate) {
      onUpdate({
        ...task,
        description
      });
    }
  };
  
  const formatDate = (dateString: string | null | Date) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('default', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <div className="bg-[#25384D] flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-[#3A4D62]">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 mr-2" 
            onClick={onClose}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-medium text-[#F1F5F9]">
            Task Details
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="border-[#3A4D62]">
            <Edit2 className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-grow p-4 overflow-y-auto space-y-6">
        <div>
          <div className="flex items-start justify-between">
            <h1 className="text-xl font-bold text-[#F1F5F9]">{task.title}</h1>
            <div className="flex space-x-2">
              <Badge className={getStatusColor(task.status)}>
                {task.status}
              </Badge>
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mt-2 text-sm text-[#CBD5E1]">
            <div className="flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span>Created: {formatDate(task.created_at)}</span>
            </div>
            {task.due_date && (
              <div className="flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>Due: {formatDate(task.due_date)}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-[#F1F5F9]">Description</h3>
            {!isEditingDescription && (
              <Button variant="ghost" size="sm" onClick={() => setIsEditingDescription(true)}>
                <Edit2 className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
            )}
          </div>
          
          {isEditingDescription ? (
            <div className="space-y-2">
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-[#3A4D62] rounded-md bg-[#1C2A3A] text-[#F1F5F9] min-h-[100px]"
                placeholder="Add a description..."
              />
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setIsEditingDescription(false);
                    setDescription(task.description || '');
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={handleDescriptionSave}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-[#CBD5E1] bg-[#1C2A3A]/50 p-3 rounded-md">
              {task.description || 'No description provided.'}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-[#F1F5F9]">Subtasks</h3>
            <Button variant="ghost" size="sm">
              <PlusCircle className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
          </div>
          
          <div className="bg-[#1C2A3A]/50 p-2 rounded-md">
            {subtasks.length > 0 ? (
              <div className="space-y-1">
                {subtasks.map(subtask => (
                  <div key={subtask.id} className="flex items-center p-2 hover:bg-[#1C2A3A] rounded-md">
                    <Checkbox 
                      id={subtask.id}
                      checked={subtask.is_completed}
                      className="mr-2"
                    />
                    <label 
                      htmlFor={subtask.id}
                      className={`text-sm flex-grow cursor-pointer ${
                        subtask.is_completed ? 'text-[#718096] line-through' : 'text-[#F1F5F9]'
                      }`}
                    >
                      {subtask.title}
                    </label>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 hover:opacity-100">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-[#718096] p-2 text-center">
                No subtasks yet. Click 'Add' to create one.
              </div>
            )}
          </div>
        </div>
        
        <Separator className="bg-[#3A4D62]" />
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-[#CBD5E1]">Assignee</div>
            {task.assignee_id ? (
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${task.assignee_id}`} />
                  <AvatarFallback>
                    {task.assignee_id.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-[#F1F5F9]">
                  {task.assignee_id}
                </span>
              </div>
            ) : (
              <Button variant="outline" size="sm" className="border-dashed border-[#3A4D62]">
                <User className="h-3.5 w-3.5 mr-1" />
                Assign
              </Button>
            )}
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-[#CBD5E1]">Reporter</div>
            {task.reporter_id && (
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${task.reporter_id}`} />
                  <AvatarFallback>
                    {task.reporter_id.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-[#F1F5F9]">
                  {task.reporter_id}
                </span>
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-[#CBD5E1]">Tags</div>
            {task.tags && task.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {task.tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="bg-[#1C2A3A]">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : (
              <Button variant="outline" size="sm" className="border-dashed border-[#3A4D62]">
                <Tag className="h-3.5 w-3.5 mr-1" />
                Add Tags
              </Button>
            )}
          </div>
        </div>
        
        <Separator className="bg-[#3A4D62]" />
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-[#F1F5F9] flex items-center">
              <MessageSquare className="h-4 w-4 mr-1" />
              Comments
            </h3>
            <Button variant="ghost" size="sm">
              <PlusCircle className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
          </div>
          
          <div className="bg-[#1C2A3A]/50 p-4 rounded-md text-center text-sm text-[#718096]">
            No comments yet. Be the first to comment on this task.
          </div>
        </div>
      </div>
    </div>
  );
}
