import React, { useState, useEffect, useRef } from 'react';
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
import { useConversationScroll } from '@/hooks/useConversationScroll';

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
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  const { scrollToBottom, isAutoScrollEnabled } = useConversationScroll({
    containerRef: messagesContainerRef,
    messages,
    isStreaming,
    isSending
  });

  const renderNavigationDebug = () => {
    if (process.env.NODE_ENV !== 'production') {
      return (
        <div className="bg-slate-900 text-xs p-2 rounded-md text-slate-300 mb-2">
          <div>Active Conversation: {activeConversationId || 'none'}</div>
          <div>Navigation History: {navigationHistoryRef.current.length} entries</div>
          <div>Latest Entry: {navigationHistoryRef.current.length > 0 
            ? navigationHistoryRef.current[navigationHistoryRef.current.length-1].action 
            : 'none'}</div>
        </div>
      );
    }
    return null;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending || isStreaming) return;
    
    try {
      await sendMessage(inputValue);
      setInputValue('');
    } catch (error) {
      console.error("Error sending message:", error);
      setApiError("Failed to send message. Please try again.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isComposing) return;
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = async () => {
    if (!activeConversationId) return;
    
    try {
      await clearMessages();
    } catch (error) {
      console.error("Error clearing messages:", error);
      toast({
        title: "Error",
        description: "Failed to clear conversation",
        variant: "destructive"
      });
    }
  };

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
        className="flex-1 p-4 space-y-5 bg-gradient-to-br from-[#1C2A3A] to-[#25384D]"
        autoScroll={false}
        hideScrollbar={false}
      >
        <div ref={messagesContainerRef} className="flex flex-col space-y-5">
          {messages.map((message: Message) => (
            <MessageComponent key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="border-t border-gray-200 p-4 bg-slate-700">
        <QuickActions activeConversationId={activeConversationId} />
        
        {apiError && (
          <Alert className="mb-4 bg-amber-900/30 text-amber-200 border-amber-600/50">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span>{apiError}</span>
          </Alert>
        )}
        
        <div className="flex justify-between items-center mb-2">
          <div className="flex space-x-2">
            {!isAutoScrollEnabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={scrollToBottom}
                className="text-muted-foreground hover:text-neon-purple hover:border-neon-purple/30"
              >
                Scroll to bottom
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="text-muted-foreground hover:text-neon-red hover:border-neon-red/30" 
              onClick={handleClearChat} 
              disabled={!activeConversationId}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear conversation
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-xs text-muted-foreground mr-2">
              Using {modelSelection.name}
            </div>
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
