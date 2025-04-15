import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageSquarePlus, Plus, Trash, ChevronRight, ChevronLeft, FolderPlus, Folder, Edit, MoreVertical, MoveRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getConversations, deleteConversation, assignConversationToProject } from '@/api/messages';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { useProjects } from '@/hooks/useProjects';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { updateConversationTitle } from '@/api/messages';
import { useToast } from '@/hooks/use-toast';

interface ConversationSidebarProps {
  activeConversationId: string | null;
  setActiveConversationId: (id: string) => void;
  startNewConversation: (title?: string) => Promise<string>;
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const ConversationSidebar = forwardRef<{
  setIsOpen: (open: boolean) => void;
}, ConversationSidebarProps>(({
  activeConversationId,
  setActiveConversationId,
  startNewConversation,
  isOpen,
  toggleSidebar
}, ref) => {
  useImperativeHandle(ref, () => ({
    setIsOpen: (open: boolean) => {
      console.log(`ConversationSidebar: setIsOpen called with ${open}`);
      if (open !== isOpen) {
        toggleSidebar();
      }
    }
  }));

  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [editProjectId, setEditProjectId] = useState<string | null>(null);
  const [editProjectName, setEditProjectName] = useState('');
  const [editProjectDescription, setEditProjectDescription] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedConversationForMove, setSelectedConversationForMove] = useState<string | null>(null);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [selectedConversationForRename, setSelectedConversationForRename] = useState<string | null>(null);
  const [newConversationTitle, setNewConversationTitle] = useState('');
  const [isDeleteProjectDialogOpen, setIsDeleteProjectDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const {
    projects,
    isLoadingProjects,
    activeProjectId,
    setActiveProjectId,
    createProject,
    updateProject,
    deleteProject,
    moveConversationToProject,
    isCreatingProject,
    isUpdatingProject
  } = useProjects();

  const {
    data: conversations = [],
    isLoading,
    refetch: refetchConversations
  } = useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations,
    refetchInterval: 5000,
  });

  useEffect(() => {
    console.log('Conversations data loaded:', conversations.length > 0 ? 'Yes' : 'No');
    if (conversations.length > 0) {
      console.log('Sample conversation:', conversations[0]);
    }
  }, [conversations]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      if (!mobile && !isOpen) setIsOpen(true);
      if (mobile && isOpen) setIsOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  const handleNewConversation = async () => {
    try {
      console.log("Creating new conversation from sidebar");
      const newId = await startNewConversation();
      setActiveConversationId(newId);
      refetchConversations();
      if (isMobile) {
        toggleSidebar();
      }
    } catch (error) {
      console.error("Error creating new conversation:", error);
    }
  };

  const handleConversationClick = (conversationId: string) => {
    if (conversationId !== activeConversationId) {
      console.log(`Switching to conversation: ${conversationId}`);
      setActiveConversationId(conversationId);
    }
    if (isMobile) {
      toggleSidebar();
    }
  };

  const handleDeleteConversation = async (conversationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    await deleteConversation(conversationId);
    refetchConversations();
    if (conversationId === activeConversationId) {
      const remainingConversations = conversations.filter(c => c.id !== conversationId);
      if (remainingConversations.length > 0) {
        setActiveConversationId(remainingConversations[0].id);
      } else {
        setActiveConversationId(null);
      }
    }
  };

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      createProject(newProjectName.trim(), newProjectDescription.trim() || undefined);
      setNewProjectName('');
      setNewProjectDescription('');
      setIsCreateDialogOpen(false);
    }
  };

  const handleUpdateProject = () => {
    if (editProjectId && editProjectName.trim()) {
      updateProject(editProjectId, {
        name: editProjectName.trim(),
        description: editProjectDescription.trim() || undefined
      });
      setEditProjectId(null);
      setEditProjectName('');
      setEditProjectDescription('');
      setIsEditDialogOpen(false);
    }
  };

  const handleEditProject = (projectId: string, name: string, description: string = '') => {
    setEditProjectId(projectId);
    setEditProjectName(name);
    setEditProjectDescription(description || '');
    setIsEditDialogOpen(true);
  };

  const handleDeleteProjectPrompt = (projectId: string) => {
    setProjectToDelete(projectId);
    setIsDeleteProjectDialogOpen(true);
  };

  const handleConfirmDeleteProject = async () => {
    if (projectToDelete) {
      await deleteProject(projectToDelete);
      setIsDeleteProjectDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleMoveConversation = (conversationId: string) => {
    console.log(`Preparing to move conversation: ${conversationId}`);
    setSelectedConversationForMove(conversationId);
    setIsMoveDialogOpen(true);
  };

  const handleMoveToProject = async (projectId: string) => {
    if (selectedConversationForMove) {
      console.log(`Moving conversation ${selectedConversationForMove} to project ${projectId || 'Open Chats'}`);
      try {
        const success = await assignConversationToProject(selectedConversationForMove, projectId);
        
        if (success) {
          toast({
            title: "Conversation moved",
            description: `The conversation has been moved to ${projectId ? 'the selected project' : 'Open Chats'}`,
          });
          await refetchConversations();
        } else {
          toast({
            title: "Error moving conversation",
            description: "Failed to move the conversation",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error moving conversation:", error);
        toast({
          title: "Error moving conversation",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
      
      setSelectedConversationForMove(null);
      setIsMoveDialogOpen(false);
    }
  };

  const handleRenameConversation = (conversationId: string, currentTitle: string) => {
    setSelectedConversationForRename(conversationId);
    setNewConversationTitle(currentTitle);
    setIsRenameDialogOpen(true);
  };

  const handleConfirmRename = async () => {
    if (selectedConversationForRename && newConversationTitle.trim()) {
      await updateConversationTitle(selectedConversationForRename, newConversationTitle.trim());
      refetchConversations();
      setIsRenameDialogOpen(false);
      setSelectedConversationForRename(null);
      setNewConversationTitle('');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredConversations = conversations.filter(conversation => 
    activeProjectId 
      ? conversation.project_id === activeProjectId 
      : !conversation.project_id
  );

  return <>
      {!isOpen && <div className="h-full flex items-center cursor-pointer bg-gradient-to-r from-neon-purple/20 to-transparent hover:from-neon-purple/40 transition-all duration-300 border-r border-neon-purple/20" onClick={toggleSidebar}>
          <div className="p-2 bg-white rounded-full shadow-lg mr-[-12px] neon-glow-purple">
            <ChevronRight size={16} className="text-neon-purple animate-pulse" />
          </div>
        </div>}
      
      <div className={`h-full ${isOpen ? 'w-72' : 'w-0'} bg-gradient-to-b from-[#f8f9ff] to-[#f1f0fb] transition-all duration-300 border-r border-neon-purple/20 shadow-lg`}>
        {isMobile && <Button variant="ghost" size="icon" className="absolute top-3 right-3 z-50 md:hidden" onClick={toggleSidebar}>
            <MessageSquarePlus />
          </Button>}

        <div className={`flex flex-col h-full overflow-hidden ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          {!isMobile && isOpen && <Button variant="ghost" size="icon" className="absolute top-3 right-3 hover:bg-neon-purple/10 rounded-full" onClick={toggleSidebar}>
              <ChevronLeft size={16} className="text-neon-purple" />
            </Button>}
          
          <div className="p-4 space-y-2">
            <Button className="w-full justify-start gap-2 bg-gradient-to-r from-neon-purple to-neon-blue text-white rounded-full shadow-md hover:shadow-lg hover:brightness-110 transition-all" onClick={handleNewConversation}>
              <Plus size={16} />
              New Chat
            </Button>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start gap-2 border-neon-purple/30 text-neon-purple hover:bg-neon-purple/10 rounded-full">
                  <FolderPlus size={16} />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Create a new project to organize your conversations.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input 
                      id="name" 
                      value={newProjectName} 
                      onChange={(e) => setNewProjectName(e.target.value)} 
                      placeholder="Enter project name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea 
                      id="description" 
                      value={newProjectDescription} 
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                      placeholder="Enter project description"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateProject} disabled={!newProjectName.trim() || isCreatingProject}>
                    Create Project
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Project</DialogTitle>
                  <DialogDescription>
                    Update your project details.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Project Name</Label>
                    <Input 
                      id="edit-name" 
                      value={editProjectName} 
                      onChange={(e) => setEditProjectName(e.target.value)} 
                      placeholder="Enter project name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description (optional)</Label>
                    <Textarea 
                      id="edit-description" 
                      value={editProjectDescription} 
                      onChange={(e) => setEditProjectDescription(e.target.value)}
                      placeholder="Enter project description"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleUpdateProject} disabled={!editProjectName.trim() || isUpdatingProject}>
                    Update Project
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Move to Project</DialogTitle>
                  <DialogDescription>
                    Select a project to move this conversation to.
                  </DialogDescription>
                </DialogHeader>
                <div className="max-h-80 overflow-y-auto space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleMoveToProject('')}
                  >
                    <span className="flex-1 text-left">Open Chats</span>
                  </Button>
                  {projects && projects.map((project) => (
                    <Button 
                      key={project.id} 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => handleMoveToProject(project.id)}
                    >
                      <Folder className="mr-2 h-4 w-4" />
                      <span className="flex-1 text-left">{project.name}</span>
                    </Button>
                  ))}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsMoveDialogOpen(false)}>Cancel</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rename Conversation</DialogTitle>
                  <DialogDescription>
                    Enter a new name for this conversation.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="conversation-name">Conversation Name</Label>
                    <Input 
                      id="conversation-name" 
                      value={newConversationTitle}
                      onChange={(e) => setNewConversationTitle(e.target.value)}
                      placeholder="Enter conversation name"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleConfirmRename} disabled={!newConversationTitle.trim()}>
                    Rename
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isDeleteProjectDialogOpen} onOpenChange={setIsDeleteProjectDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Project</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this project? All associated chats will be moved to Open Chats.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeleteProjectDialogOpen(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={handleConfirmDeleteProject}>
                    Delete Project
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <Separator className="bg-neon-purple/20" />
          
          <div className="flex-1 overflow-y-auto py-3 px-2 bg-slate-800">
            {isLoadingProjects ? (
              <div className="flex justify-center p-4">
                <div className="loading-dots flex items-center">
                  <div className="h-2 w-2 bg-neon-purple rounded-full mx-1 animate-pulse"></div>
                  <div className="h-2 w-2 bg-neon-purple rounded-full mx-1 animate-pulse" style={{
                    animationDelay: '0.2s'
                  }}></div>
                  <div className="h-2 w-2 bg-neon-purple rounded-full mx-1 animate-pulse" style={{
                    animationDelay: '0.4s'
                  }}></div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 px-2">
                <div className="space-y-2">
                  <button 
                    onClick={() => setActiveProjectId(null)}
                    className={`w-full text-left font-medium px-2 py-1 rounded hover:bg-white/10 transition-colors flex items-center justify-between ${!activeProjectId ? 'bg-white/20 text-white' : 'text-gray-300'}`}
                  >
                    <span className="flex items-center">
                      <MessageSquarePlus className="mr-2 h-4 w-4" />
                      Open Chats
                    </span>
                    <ChevronRight className={`h-4 w-4 transition-transform ${!activeProjectId ? 'rotate-90' : ''}`} />
                  </button>
                  
                  {!activeProjectId && (
                    <div className="ml-3 space-y-1 animate-slideDown">
                      {isLoading ? (
                        <div className="flex justify-center p-4">
                          <div className="loading-dots flex items-center">
                            <div className="h-2 w-2 bg-neon-purple rounded-full mx-1 animate-pulse"></div>
                            <div className="h-2 w-2 bg-neon-purple rounded-full mx-1 animate-pulse" style={{
                              animationDelay: '0.2s'
                            }}></div>
                            <div className="h-2 w-2 bg-neon-purple rounded-full mx-1 animate-pulse" style={{
                              animationDelay: '0.4s'
                            }}></div>
                          </div>
                        </div>
                      ) : (
                        <>
                          {filteredConversations.length === 0 ? (
                            <div className="p-3 text-center text-gray-400 italic text-sm">No open chats</div>
                          ) : (
                            filteredConversations.map(conversation => (
                              <div 
                                key={conversation.id} 
                                className={`
                                  group flex justify-between items-center rounded-xl px-3 py-2 cursor-pointer hover-scale
                                  transition-all duration-200 border
                                  ${activeConversationId === conversation.id ? 'bg-white shadow-md border-neon-purple/30 neon-glow-purple' : 'bg-white/5 border-transparent hover:bg-white/10'}
                                `} 
                                onClick={() => handleConversationClick(conversation.id)}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className={`font-medium truncate ${activeConversationId === conversation.id ? 'text-neon-purple' : 'text-gray-300'}`}>
                                    {conversation.title}
                                  </div>
                                  <div className="text-xs text-gray-400 truncate">
                                    {formatDate(conversation.updated_at)}
                                  </div>
                                </div>
                                
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 hover:bg-white/10 rounded-full transition-all"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreVertical size={14} />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-48" side="right">
                                    <div className="space-y-1">
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="w-full justify-start text-sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRenameConversation(conversation.id, conversation.title);
                                        }}
                                      >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Rename
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="w-full justify-start text-sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleMoveConversation(conversation.id);
                                        }}
                                      >
                                        <MoveRight className="mr-2 h-4 w-4" />
                                        Move to Project
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="w-full justify-start text-sm text-red-500 hover:text-red-600 hover:bg-red-100/10"
                                        onClick={(e) => handleDeleteConversation(conversation.id, e)}
                                      >
                                        <Trash className="mr-2 h-4 w-4" />
                                        Delete
                                      </Button>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              </div>
                            ))
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                {projects.map(project => (
                  <div key={project.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={() => setActiveProjectId(project.id === activeProjectId ? null : project.id)}
                        className={`flex-grow text-left font-medium px-2 py-1 rounded hover:bg-white/10 transition-colors flex items-center justify-between ${activeProjectId === project.id ? 'bg-white/20 text-white' : 'text-gray-300'}`}
                      >
                        <span className="flex items-center truncate pr-2">
                          <Folder className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{project.name}</span>
                        </span>
                        <ChevronRight className={`h-4 w-4 transition-transform ${activeProjectId === project.id ? 'rotate-90' : ''}`} />
                      </button>
                      
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 hover:bg-white/10 rounded-full transition-all ml-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical size={14} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48" side="right">
                          <div className="space-y-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full justify-start text-sm"
                              onClick={() => handleEditProject(project.id, project.name, project.description || '')}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Project
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full justify-start text-sm text-red-500 hover:text-red-600 hover:bg-red-100/10"
                              onClick={() => handleDeleteProjectPrompt(project.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete Project
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    {activeProjectId === project.id && (
                      <div className="ml-3 space-y-1 animate-slideDown">
                        {isLoading ? (
                          <div className="flex justify-center p-4">
                            <div className="loading-dots flex items-center">
                              <div className="h-2 w-2 bg-neon-purple rounded-full mx-1 animate-pulse"></div>
                              <div className="h-2 w-2 bg-neon-purple rounded-full mx-1 animate-pulse" style={{
                                animationDelay: '0.2s'
                              }}></div>
                              <div className="h-2 w-2 bg-neon-purple rounded-full mx-1 animate-pulse" style={{
                                animationDelay: '0.4s'
                              }}></div>
                            </div>
                          </div>
                        ) : (
                          <>
                            {filteredConversations.length === 0 ? (
                              <div className="p-3 text-center text-gray-400 italic text-sm">No conversations in this project</div>
                            ) : (
                              filteredConversations.map(conversation => (
                                <div 
                                  key={conversation.id} 
                                  className={`
                                    group flex justify-between items-center rounded-xl px-3 py-2 cursor-pointer hover-scale
                                    transition-all duration-200 border
                                    ${activeConversationId === conversation.id ? 'bg-white shadow-md border-neon-purple/30 neon-glow-purple' : 'bg-white/5 border-transparent hover:bg-white/10'}
                                  `} 
                                  onClick={() => handleConversationClick(conversation.id)}
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className={`font-medium truncate ${activeConversationId === conversation.id ? 'text-neon-purple' : 'text-gray-300'}`}>
                                      {conversation.title}
                                    </div>
                                    <div className="text-xs text-gray-400 truncate">
                                      {formatDate(conversation.updated_at)}
                                    </div>
                                  </div>
                                  
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 hover:bg-white/10 rounded-full transition-all"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <MoreVertical size={14} />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-48" side="right">
                                      <div className="space-y-1">
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="w-full justify-start text-sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleMoveConversation(conversation.id);
                                          }}
                                        >
                                          <MoveRight className="mr-2 h-4 w-4" />
                                          Move to Project
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="w-full justify-start text-sm text-red-500 hover:text-red-600 hover:bg-red-100/10"
                                          onClick={(e) => handleDeleteConversation(conversation.id, e)}
                                        >
                                          <Trash className="mr-2 h-4 w-4" />
                                          Delete
                                        </Button>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              ))
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                {projects.length === 0 && !isLoadingProjects && (
                  <div className="p-4 text-center text-gray-400">
                    <Folder className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No projects created yet</p>
                    <p className="text-sm">Use the "New Project" button to create your first project</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>;
});
