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
import { useNavigate, useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const location = useLocation();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const {
    selectedModel,
    toggleModel,
    modelSelection
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
  const navigationHistoryRef = useRef<{timestamp: number, action: string, path: string}[]>([]);
  const [isOnChatTab, setIsOnChatTab] = useState(false);
  const navigationTimerRef = useRef<number | null>(null);
  const latestCreatedConversationRef = useRef<string | null>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  const lastScrollPosition = useRef<number>(0);
  const isManuallyScrolling = useRef<boolean>(false);

  const forceNavigation = (path: string, state?: any) => {
    console.log(`🚀 ChatSection: Forcing navigation to ${path}`, state);
    navigate(path, {
      state: {
        ...state,
        forceReload: Date.now()
      },
      replace: true
    });
  };

  useEffect(() => {
    const state = location.state as { activeTab?: string } | undefined;
    const onChatTab = state?.activeTab === 'chat';
    console.log(`Navigation state check: isOnChatTab=${onChatTab}, path=${location.pathname}, state=`, state);
    setIsOnChatTab(onChatTab);
    
    navigationHistoryRef.current.push({
      timestamp: Date.now(),
      action: 'location_change',
      path: location.pathname + (state ? `(activeTab: ${state.activeTab})` : '')
    });
    
    if (navigationHistoryRef.current.length > 10) {
      navigationHistoryRef.current.shift();
    }

    if (onChatTab && latestCreatedConversationRef.current && !activeConversationId) {
      console.log(`🔄 ChatSection: Setting active conversation to ${latestCreatedConversationRef.current} after navigation to chat tab`);
      setActiveConversationId(latestCreatedConversationRef.current);
    }
  }, [location, setActiveConversationId, activeConversationId]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      
      if (Math.abs(scrollTop - lastScrollPosition.current) > 10) {
        isManuallyScrolling.current = true;
        setShouldAutoScroll(isAtBottom);
      }
      
      lastScrollPosition.current = scrollTop;
    };
    
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = () => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if ((isStreaming || isSending || messages.length > 0) && shouldAutoScroll) {
      scrollToBottom();
    }
  }, [messages, isStreaming, isSending, shouldAutoScroll]);

  useEffect(() => {
    if (isSending) {
      setShouldAutoScroll(true);
      isManuallyScrolling.current = false;
    }
  }, [isSending]);
  
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    setApiError(null);
    
    setShouldAutoScroll(true);
    isManuallyScrolling.current = false;
    
    try {
      if (!activeConversationId) {
        console.log("🔍 ChatSection: Starting new chat creation process...");
        
        const userMessage = inputValue;
        setInputValue('');
        setIsNavigating(true);
        
        console.log("🔍 ChatSection: Creating new conversation...");
        const newConversationId = await startConversation('New conversation', selectedProjectId);
        console.log(`✅ ChatSection: New chat created with ID: ${newConversationId}`);
        
        latestCreatedConversationRef.current = newConversationId;
        
        console.log(`✅ ChatSection: Setting ${newConversationId} as active conversation`);
        setActiveConversationId(newConversationId);
        
        console.log("🔄 ChatSection: Refreshing conversations list immediately");
        await refetchConversations();
        
        console.log("⏱️ ChatSection: Scheduling navigation to chat tab after delay");
        
        forceNavigation('/', { 
          activeTab: 'chat',
          newConversationId: newConversationId
        });
        
        setTimeout(async () => {
          try {
            console.log(`✉️ ChatSection: Sending first message to conversation ${newConversationId}`);
            console.log(`🤖 Using ${selectedModel} model for this message`);
            await sendMessage(userMessage, 'user', newConversationId);
            console.log(`✅ ChatSection: Successfully sent first message to ${newConversationId}`);
            
            if (!activeConversationId) {
              console.log(`🔄 ChatSection: Resetting active conversation to ${newConversationId} before ending navigation`);
              setActiveConversationId(newConversationId);
            }
            
            setIsNavigating(false);
          } catch (delayedError: any) {
            console.error("❌ Error in delayed operations:", delayedError);
            setIsNavigating(false);
            toast({
              title: 'Error',
              description: 'Failed to complete chat initialization',
              variant: 'destructive'
            });
          }
        }, 800);
      } else {
        console.log(`✉️ ChatSection: Sending message to existing conversation: ${activeConversationId}`);
        console.log(`🤖 Using ${selectedModel} model for this message`);
        await sendMessage(inputValue, 'user', activeConversationId);
        setInputValue('');
      }
    } catch (error: any) {
      console.error('❌ Error in send message flow:', error);
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
      console.log("🔍 ChatSection: handleNewChat - Creating new conversation");
      setIsNavigating(true);
      
      const newConversationId = await startConversation('New conversation', selectedProjectId);
      
      latestCreatedConversationRef.current = newConversationId;
      
      console.log(`✅ ChatSection: handleNewChat - Setting active conversation to ${newConversationId}`);
      setActiveConversationId(newConversationId);
      
      console.log("🔄 ChatSection: handleNewChat - Refetching conversations");
      await refetchConversations();
      
      setInputValue('');
      setApiError(null);
      
      console.log("🚀 ChatSection: handleNewChat - Initiating navigation to chat tab");
      forceNavigation('/', { 
        activeTab: 'chat',
        newConversationId: newConversationId
      });
      
      setTimeout(() => {
        setIsNavigating(false);
        
        toast({
          title: 'New chat started',
          description: 'You can now start a new conversation'
        });
      }, 800);
    } catch (error) {
      console.error('❌ Error creating new chat:', error);
      setIsNavigating(false);
      
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

  const renderNavigationDebug = () => {
    if (process.env.NODE_ENV !== 'production') {
      return (
        <div className="text-xs text-gray-400 border-t border-gray-700 mt-4 pt-2">
          <div>{`🧭 Path: ${location.pathname}`}</div>
          <div>{`🏷️ Active Tab: ${(location.state as any)?.activeTab || 'none'}`}</div>
          <div>{`💬 Active Conv: ${activeConversationId || 'none'}`}</div>
          <div>{`💬 Latest Conv: ${latestCreatedConversationRef.current || 'none'}`}</div>
          <div>{`🔄 Force Reload: ${(location.state as any)?.forceReload || 'none'}`}</div>
          <div>{`🔄 Pending Conv: ${(location.state as any)?.pendingConversationId || 'none'}`}</div>
        </div>
      );
    }
    return null;
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
        {renderNavigationDebug()}
      </div>
    );
  }

  if (isNavigating) {
    return (
      <div className="flex flex-col h-full justify-center items-center text-muted-foreground">
        <Loader2 className="h-8 w-8 text-neon-purple animate-spin" />
        <p className="mt-4 font-medium">Preparing your conversation...</p>
        {renderNavigationDebug()}
      </div>
    );
  }

  if (activeConversationId && messages.length === 0 && retryCount > 0 && retryCount < 3) {
    return (
      <div className="flex flex-col h-full justify-center items-center text-muted-foreground">
        <Loader2 className="h-8 w-8 text-neon-purple animate-spin" />
        <p className="mt-4 font-medium">Loading conversation...</p>
        {renderNavigationDebug()}
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
          
          <div className="relative">
            <Textarea 
              value={inputValue} 
              onChange={e => setInputValue(e.target.value)} 
              onKeyDown={handleKeyDown} 
              onCompositionStart={() => setIsComposing(true)} 
              onCompositionEnd={() => setIsComposing(false)} 
              placeholder={`Type your engineering question here... (using ${modelSelection.name})`}
              className="min-h-[80px] resize-none pr-12 rounded-md border border-neon-purple/30 focus:border-neon-purple focus:shadow-[0_0_8px_rgba(168,85,247,0.2)] transition-all" 
            />
            <Button 
              size="icon" 
              className={`absolute right-2 bottom-2 ${
                selectedModel === 'deepseek' 
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:brightness-110 hover:shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                  : 'bg-gradient-to-r from-[#0EA5E9] to-[#14B8A6] hover:brightness-110 hover:shadow-[0_0_8px_rgba(20,184,166,0.4)]'
              } text-white`}
              onClick={handleSendMessage} 
              disabled={!inputValue.trim() || isSending || isNavigating}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <ModelToggle currentModel={selectedModel} onToggle={toggleModel} />
            <div className="text-xs text-muted-foreground">
              Using {modelSelection.name}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {renderNavigationDebug()}
      
      <ScrollArea 
        className="flex-1 p-4 space-y-5 chat-container bg-gradient-to-br from-[#1C2A3A] to-[#25384D] overflow-hidden"
        autoScroll={false}
        hideScrollbar={false}
      >
        <div ref={messagesContainerRef} className="flex flex-col space-y-5 w-full">
          {messages.map((message: Message) => (
            <MessageComponent key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="border-t border-gray-200 p-4 bg-slate-700 chat-input-container">
        <QuickActions activeConversationId={activeConversationId} />
        
        {apiError && (
          <Alert className="mb-4 bg-amber-900/30 text-amber-200 border-amber-600/50">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span>{apiError}</span>
          </Alert>
        )}
        
        <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-muted-foreground hover:text-neon-red hover:border-neon-red/30 hover:shadow-[0_0_8px_rgba(244,63,94,0.2)] clear-chat-button" 
              onClick={handleClearChat} 
              disabled={!activeConversationId}
              title="Clear conversation"
            >
              <Trash2 className="h-4 w-4" />
              <span className="ml-1">Clear</span>
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            {!isMobile && (
              <div className="text-xs text-muted-foreground mr-2">
                Using {modelSelection.name}
              </div>
            )}
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
            placeholder={`Type your engineering question here... (using ${modelSelection.name})`} 
            className="min-h-[80px] resize-none pr-12 rounded-md border border-neon-purple/30 focus:border-neon-purple focus:shadow-[0_0_8px_rgba(168,85,247,0.2)] transition-all" 
            disabled={isSending || isStreaming || !activeConversationId || isNavigating} 
          />
          
          <Button 
            size="icon" 
            className={`absolute right-2 bottom-2 ${
              selectedModel === 'deepseek' 
                ? 'bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:brightness-110 hover:shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                : 'bg-gradient-to-r from-[#0EA5E9] to-[#14B8A6] hover:brightness-110 hover:shadow-[0_0_8px_rgba(20,184,166,0.4)]'
            } text-white`}
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
