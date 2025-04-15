
import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, AlertTriangle, Folder, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useToast } from '@/hooks/use-toast';
import { Message } from '@/utils/types';
import { Message as MessageComponent } from '@/components/Message';
import { QuickActions } from '@/components/QuickActions';
import { useIsMobile } from '@/hooks/use-mobile';
import { ModelToggle } from '@/components/ModelToggle';
import { useModelSelection } from '@/hooks/useModelSelection';
import { Alert } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ProjectSelect } from '@/components/ProjectSelect';

interface ChatSectionProps {
  activeConversationId: string | null;
  messages: Message[];
  isLoading: boolean;
}

export function ChatSection({
  activeConversationId,
  messages,
  isLoading
}: ChatSectionProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const {
    selectedModel,
    toggleModel
  } = useModelSelection();
  const {
    inputValue,
    setInputValue,
    sendMessage,
    clearMessages,
    isSending,
    isStreaming,
    startConversation,
    setActiveConversationId,
    refetchConversations 
  } = useChatMessages();
  const [isComposing, setIsComposing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    toast
  } = useToast();
  const [retryCount, setRetryCount] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    if (activeConversationId && messages.length === 0 && !isLoading && retryCount < 3) {
      const timer = setTimeout(() => {
        console.warn('Chat messages appear to be missing, retrying fetch...');
        setRetryCount(prev => prev + 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [activeConversationId, messages, isLoading, retryCount]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    setApiError(null);
    
    try {
      if (!activeConversationId) {
        console.log("ChatSection: Starting new chat creation process...");
        
        // Store the user message temporarily
        const userMessage = inputValue;
        
        // Clear input immediately for better UX
        setInputValue('');
        
        // Create new conversation first - critical step
        const newConversationId = await startConversation('New conversation', selectedProjectId);
        console.log(`ChatSection: New chat created with ID: ${newConversationId}`);
        
        // CRITICAL - Set as active conversation immediately to trigger navigation
        // This should activate the useEffect in ChatLayout
        setActiveConversationId(newConversationId);
        console.log(`ChatSection: Set ${newConversationId} as active conversation - navigation should trigger`);
        
        // Mark that we're about to navigate
        setIsNavigating(true);
        console.log("ChatSection: Setting isNavigating flag to true");
        
        // Force navigation to the main chat tab with a small delay
        console.log("ChatSection: Will force navigation to chat tab after short delay");
        setTimeout(() => {
          console.log("ChatSection: Now executing delayed navigation to chat tab");
          navigate('/', { state: { activeTab: 'chat', forceReload: new Date().getTime() } });
          
          // Small delay after navigation before sending message
          setTimeout(async () => {
            try {
              console.log("ChatSection: Refreshing conversations list...");
              await refetchConversations();
              
              console.log(`ChatSection: Sending first message to new conversation ${newConversationId}`);
              await sendMessage(userMessage, 'user', newConversationId);
              
              console.log(`ChatSection: Successfully initialized new chat ${newConversationId} with first message`);
              setIsNavigating(false);
            } catch (delayedError) {
              console.error("Error in delayed operations:", delayedError);
              setIsNavigating(false);
              toast({
                title: 'Error',
                description: 'Failed to complete chat initialization',
                variant: 'destructive'
              });
            }
          }, 300);
        }, 300);
      } else {
        console.log(`ChatSection: Sending message to existing conversation: ${activeConversationId}`);
        await sendMessage(inputValue, 'user', activeConversationId);
        setInputValue('');
      }
    } catch (error: any) {
      console.error('Error in send message flow:', error);
      setIsNavigating(false);
      
      if (error.message?.includes('API key') && selectedModel === 'deepseek') {
        setApiError('DeepSeek API key is missing or invalid. The service requires configuration.');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to send message. Please try again.',
          variant: 'destructive'
        });
      }
    }
  };

  const handleNewChat = async () => {
    try {
      console.log("ChatSection: handleNewChat - Creating new conversation");
      const newConversationId = await startConversation('New conversation', selectedProjectId);
      
      console.log(`ChatSection: handleNewChat - Setting active conversation to ${newConversationId}`);
      setActiveConversationId(newConversationId);
      
      console.log("ChatSection: handleNewChat - Refetching conversations");
      refetchConversations();
      
      setInputValue('');
      setApiError(null);
      
      // Force navigation to ensure UI updates
      console.log("ChatSection: handleNewChat - Forcing navigation to chat tab");
      navigate('/', { state: { activeTab: 'chat', forceReload: new Date().getTime() } });
      
      toast({
        title: 'New chat started',
        description: 'You can now start a new conversation'
      });
    } catch (error) {
      console.error('Error creating new chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to create a new chat',
        variant: 'destructive'
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = async () => {
    if (window.confirm('Are you sure you want to clear this conversation?')) {
      await clearMessages(activeConversationId);
      toast({
        title: 'Chat cleared',
        description: 'All messages have been cleared from this conversation'
      });
    }
  };

  const navigateToDashboard = () => {
    navigate('/', {
      state: {
        activeTab: 'main'
      }
    });
  };

  const MoveToProjectDialog = ({ isOpen, onClose, onMove, selectedConversation, projects }: any) => {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
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
              onClick={() => onMove('')}
            >
              <span className="flex-1 text-left">Open Chats</span>
            </Button>
            {projects && projects.map((project: any) => (
              <Button 
                key={project.id} 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onMove(project.id)}
              >
                <Folder className="mr-2 h-4 w-4" />
                <span className="flex-1 text-left">{project.name}</span>
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full justify-center items-center text-muted-foreground">
        <div className="loading-dots flex items-center">
          <div className="h-3 w-3 bg-neon-purple rounded-full mx-1 animate-pulse"></div>
          <div className="h-3 w-3 bg-neon-purple rounded-full mx-1 animate-pulse" style={{
            animationDelay: '0.2s'
          }}></div>
          <div className="h-3 w-3 bg-neon-purple rounded-full mx-1 animate-pulse" style={{
            animationDelay: '0.4s'
          }}></div>
        </div>
        <p className="mt-4 font-medium">Initializing ActionBot...</p>
      </div>
    );
  }

  if (isNavigating) {
    return (
      <div className="flex flex-col h-full justify-center items-center text-muted-foreground">
        <Loader2 className="h-8 w-8 text-neon-purple animate-spin" />
        <p className="mt-4 font-medium">Preparing your conversation...</p>
      </div>
    );
  }

  if (activeConversationId && messages.length === 0 && retryCount > 0 && retryCount < 3) {
    return (
      <div className="flex flex-col h-full justify-center items-center text-muted-foreground">
        <Loader2 className="h-8 w-8 text-neon-purple animate-spin" />
        <p className="mt-4 font-medium">Loading conversation...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col h-full justify-center items-center p-4 text-center">
        <div className="max-w-md actionbot-card p-4 sm:p-8 rounded-xl border border-gray-100 shadow-lg bg-cyan-950">
          <div className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 bg-gradient-to-r from-[#C084FC] to-[#D946EF] rounded-full flex items-center justify-center text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Send className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">ActionBot Ready</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
            Your engineering assistant is ready to help. What would you like to accomplish today?
          </p>
          
          <div className="grid gap-2 mb-6 sm:mb-8">
            {[
              "Debug this error: TypeError: Cannot read property 'map' of undefined",
              "Review my API endpoint for security issues",
              "Optimize this database query for better performance",
              "Help me set up Kubernetes monitoring for our cluster"
            ].map((question, i) => (
              <Button 
                key={i} 
                variant="outline" 
                onClick={() => setInputValue(question)} 
                className="justify-start h-auto text-xs sm:text-sm border border-neon-purple/20 hover:border-neon-purple/40 hover:shadow-[0_0_8px_rgba(168,85,247,0.3)] transition-all py-2 px-3 sm:py-[8px] sm:px-4 text-left mx-0 my-0 font-light break-words whitespace-normal"
                style={{ minHeight: '2.5rem' }}
              >
                <span className="line-clamp-2">{question}</span>
              </Button>
            ))}
          </div>
          
          {selectedModel === 'deepseek' && (
            <Alert className="mb-4 bg-amber-900/30 text-amber-200 border-amber-600/50">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span>DeepSeek API key is missing or invalid. The service requires configuration.</span>
            </Alert>
          )}
          
          <div className="mb-4">
            <ProjectSelect
              onProjectSelect={setSelectedProjectId}
              className="w-full mb-4"
            />
          </div>
          
          <div className="relative">
            <Textarea 
              value={inputValue} 
              onChange={e => setInputValue(e.target.value)} 
              onKeyDown={handleKeyDown} 
              onCompositionStart={() => setIsComposing(true)} 
              onCompositionEnd={() => setIsComposing(false)} 
              placeholder="Type your engineering question here..." 
              className="min-h-[80px] resize-none pr-12 rounded-md border border-neon-purple/30 focus:border-neon-purple focus:shadow-[0_0_8px_rgba(168,85,247,0.2)] transition-all" 
            />
            <Button 
              size="icon" 
              className="absolute right-2 bottom-2 bg-gradient-to-r from-[#C084FC] to-[#D946EF] text-white hover:brightness-110 hover:shadow-[0_0_8px_rgba(168,85,247,0.4)]" 
              onClick={handleSendMessage} 
              disabled={!inputValue.trim() || isSending || isNavigating}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <Button 
              variant="outline" 
              onClick={handleNewChat}
              className="text-neon-purple border-neon-purple/40 hover:bg-neon-purple/10"
            >
              Start New Chat
            </Button>
            <ModelToggle currentModel={selectedModel} onToggle={toggleModel} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-gradient-to-br from-[#1C2A3A] to-[#25384D]">
        {messages.map((message: Message) => (
          <MessageComponent key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t border-gray-200 p-4 bg-slate-700">
        <QuickActions />
        
        {apiError && (
          <Alert className="mb-4 bg-amber-900/30 text-amber-200 border-amber-600/50">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span>{apiError}</span>
          </Alert>
        )}
        
        <div className="flex justify-between items-center mb-2">
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-neon-purple border-neon-purple/30 hover:border-neon-purple/60 hover:bg-neon-purple/10" 
              onClick={handleNewChat}
            >
              <Send className="h-4 w-4 mr-1" />
              New chat
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="text-muted-foreground hover:text-neon-red hover:border-neon-red/30 hover:shadow-[0_0_8px_rgba(244,63,94,0.2)]" 
              onClick={handleClearChat} 
              disabled={!activeConversationId}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear conversation
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <div className="model-toggle">
              <ModelToggle currentModel={selectedModel} onToggle={toggleModel} />
            </div>
          </div>
        </div>
        
        <div className="relative">
          <Textarea 
            value={inputValue} 
            onChange={e => setInputValue(e.target.value)} 
            onKeyDown={handleKeyDown} 
            onCompositionStart={() => setIsComposing(true)} 
            onCompositionEnd={() => setIsComposing(false)} 
            placeholder="Type your engineering question here..." 
            className="min-h-[80px] resize-none pr-12 rounded-md border border-neon-purple/30 focus:border-neon-purple focus:shadow-[0_0_8px_rgba(168,85,247,0.2)] transition-all" 
            disabled={isSending || isStreaming || !activeConversationId || isNavigating} 
          />
          
          <Button 
            size="icon" 
            className="absolute right-2 bottom-2 bg-gradient-to-r from-[#C084FC] to-[#D946EF] text-white hover:brightness-110 hover:shadow-[0_0_8px_rgba(168,85,247,0.4)]" 
            onClick={handleSendMessage} 
            disabled={!inputValue.trim() || isSending || isStreaming || !activeConversationId || isNavigating}
          >
            <Send className="h-4 w-4" />
          </Button>
          
          {(isSending || isStreaming) && (
            <div className="absolute right-14 bottom-12 text-xs text-muted-foreground">
              <div className="flex items-center">
                <div className="h-2 w-2 bg-neon-purple rounded-full mr-1 animate-pulse"></div>
                <div className="h-2 w-2 bg-neon-purple rounded-full mx-1 animate-pulse" style={{
                  animationDelay: '0.2s'
                }}></div>
                <div className="h-2 w-2 bg-neon-purple rounded-full ml-1 animate-pulse" style={{
                  animationDelay: '0.4s'
                }}></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
