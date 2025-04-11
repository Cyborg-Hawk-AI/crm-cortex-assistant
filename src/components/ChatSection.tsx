import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2 } from 'lucide-react';
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
  const { selectedModel, toggleModel } = useModelSelection();
  const {
    inputValue,
    setInputValue,
    sendMessage,
    clearMessages,
    isSending,
    isStreaming,
    startConversation,
    setActiveConversationId
  } = useChatMessages();
  const [isComposing, setIsComposing] = useState(false);
  const {
    toast
  } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    try {
      if (!activeConversationId) {
        console.log("Creating a new conversation as part of sending the first message");
        const newConversationId = await startConversation('New conversation');
        setActiveConversationId(newConversationId);
        await sendMessage(inputValue, 'user', newConversationId, selectedModel);
      } else {
        console.log(`Sending message to active conversation: ${activeConversationId}`);
        await sendMessage(inputValue, 'user', activeConversationId, selectedModel);
      }
      setInputValue('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
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

  if (isLoading) {
    return <div className="flex flex-col h-full justify-center items-center text-muted-foreground">
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
      </div>;
  }

  if (messages.length === 0) {
    return <div className="flex flex-col h-full justify-center items-center p-4 text-center">
        <div className="max-w-md actionbot-card p-8 rounded-xl border border-gray-100 shadow-lg bg-teal-950">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[#C084FC] to-[#D946EF] rounded-full flex items-center justify-center text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Send className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-foreground">ActionBot Ready</h2>
          <p className="text-muted-foreground mb-8">
            Your engineering assistant is ready to help. What would you like to accomplish today?
          </p>
          
          <div className="grid gap-2 mb-8">
            {["Debug this error: TypeError: Cannot read property 'map' of undefined", "Review my API endpoint for security issues", "Optimize this database query for better performance", "Help me set up Kubernetes monitoring for our cluster"].map((question, i) => <Button key={i} variant="outline" onClick={() => setInputValue(question)} className="justify-start h-auto border border-neon-purple/20 hover:border-neon-purple/40 hover:shadow-[0_0_8px_rgba(168,85,247,0.3)] transition-all py-[8px] text-left mx-0 my-0 font-thin">
                {question}
              </Button>)}
          </div>
          
          <div className="relative">
            <Textarea value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={handleKeyDown} onCompositionStart={() => setIsComposing(true)} onCompositionEnd={() => setIsComposing(false)} placeholder="Type your engineering question here..." className="min-h-[80px] resize-none pr-12 rounded-md border border-neon-purple/30 focus:border-neon-purple focus:shadow-[0_0_8px_rgba(168,85,247,0.2)] transition-all" />
            <Button size="icon" className="absolute right-2 bottom-2 bg-gradient-to-r from-[#C084FC] to-[#D946EF] text-white hover:brightness-110 hover:shadow-[0_0_8px_rgba(168,85,247,0.4)]" onClick={handleSendMessage} disabled={!inputValue.trim() || isSending}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>;
  }

  return <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-gradient-to-br from-white to-gray-50 bg-slate-900">
        {messages.map((message: Message) => <MessageComponent key={message.id} message={message} />)}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t border-gray-200 p-4 bg-slate-700">
        {/* Quick Actions Section */}
        <QuickActions />
        
        <div className="flex justify-between items-center mb-2">
          <Button variant="outline" size="sm" className="text-muted-foreground hover:text-neon-red hover:border-neon-red/30 hover:shadow-[0_0_8px_rgba(244,63,94,0.2)]" onClick={handleClearChat} disabled={!activeConversationId}>
            <Trash2 className="h-4 w-4 mr-1" />
            Clear conversation
          </Button>
          
          {/* Model Selection */}
          <div className="model-toggle">
            <ModelToggle currentModel={selectedModel} onToggle={toggleModel} />
          </div>
        </div>
        
        <div className="relative">
          <Textarea value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={handleKeyDown} onCompositionStart={() => setIsComposing(true)} onCompositionEnd={() => setIsComposing(false)} placeholder="Type your engineering question here..." className="min-h-[80px] resize-none pr-12 rounded-md border border-neon-purple/30 focus:border-neon-purple focus:shadow-[0_0_8px_rgba(168,85,247,0.2)] transition-all" disabled={isSending || isStreaming || !activeConversationId} />
          
          <Button size="icon" className="absolute right-2 bottom-2 bg-gradient-to-r from-[#C084FC] to-[#D946EF] text-white hover:brightness-110 hover:shadow-[0_0_8px_rgba(168,85,247,0.4)]" onClick={handleSendMessage} disabled={!inputValue.trim() || isSending || isStreaming || !activeConversationId}>
            <Send className="h-4 w-4" />
          </Button>
          
          {(isSending || isStreaming) && <div className="absolute right-14 bottom-12 text-xs text-muted-foreground">
              <div className="flex items-center">
                <div className="h-2 w-2 bg-neon-purple rounded-full mr-1 animate-pulse"></div>
                <div className="h-2 w-2 bg-neon-purple rounded-full mx-1 animate-pulse" style={{
              animationDelay: '0.2s'
            }}></div>
                <div className="h-2 w-2 bg-neon-purple rounded-full ml-1 animate-pulse" style={{
              animationDelay: '0.4s'
            }}></div>
              </div>
            </div>}
        </div>
      </div>
    </div>;
}
