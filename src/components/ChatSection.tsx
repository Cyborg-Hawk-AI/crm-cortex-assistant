
import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useToast } from '@/hooks/use-toast';
import { Message } from '@/utils/types';

interface ChatSectionProps {
  activeConversationId: string | null;
  messages: Message[];
  isLoading: boolean;
}

export function ChatSection({ activeConversationId, messages, isLoading }: ChatSectionProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
  const { toast } = useToast();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle send message
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    try {
      // Create a new conversation if none exists
      if (!activeConversationId) {
        console.log("Creating a new conversation as part of sending the first message");
        const newConversationId = await startConversation('New conversation');
        setActiveConversationId(newConversationId);
        await sendMessage(inputValue, 'user', newConversationId);
      } else {
        // Always use the activeConversationId that's passed as a prop
        console.log(`Sending message to active conversation: ${activeConversationId}`);
        await sendMessage(inputValue, 'user', activeConversationId);
      }
      setInputValue('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle textarea key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Check for Enter key without Shift
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle clear chat
  const handleClearChat = async () => {
    if (window.confirm('Are you sure you want to clear this conversation?')) {
      await clearMessages(activeConversationId);
      toast({
        title: 'Chat cleared',
        description: 'All messages have been cleared from this conversation',
      });
    }
  };

  // Loading message UI
  if (isLoading) {
    return (
      <div className="flex flex-col h-full justify-center items-center text-muted-foreground">
        <div className="loading-dots flex items-center">
          <div className="h-3 w-3 bg-neon-purple rounded-full mx-1 animate-pulse"></div>
          <div className="h-3 w-3 bg-neon-purple rounded-full mx-1 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="h-3 w-3 bg-neon-purple rounded-full mx-1 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <p className="mt-4 font-medium">Initializing ActionBot...</p>
      </div>
    );
  }

  // Empty state - this will show when no conversation is active or when a conversation has no messages
  if (messages.length === 0) {
    return (
      <div className="flex flex-col h-full justify-center items-center p-4 text-center">
        <div className="max-w-md actionbot-card p-8 rounded-xl bg-white border border-gray-100 shadow-lg">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[#C084FC] to-[#D946EF] rounded-full flex items-center justify-center text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Send className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-foreground">ActionBot Ready</h2>
          <p className="text-muted-foreground mb-8">
            Your engineering assistant is ready to help. What would you like to accomplish today?
          </p>
          
          {/* Example questions */}
          <div className="grid gap-2 mb-8">
            {[
              "Debug this error: TypeError: Cannot read property 'map' of undefined",
              "Review my API endpoint for security issues",
              "Optimize this database query for better performance",
              "Help me set up Kubernetes monitoring for our cluster"
            ].map((question, i) => (
              <Button 
                key={i}
                variant="outline" 
                className="justify-start text-left h-auto py-2 border border-neon-purple/20 hover:border-neon-purple/40 hover:shadow-[0_0_8px_rgba(168,85,247,0.3)] transition-all"
                onClick={() => setInputValue(question)}
              >
                {question}
              </Button>
            ))}
          </div>
          
          {/* Input area with message */}
          <div className="relative">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
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
              disabled={!inputValue.trim() || isSending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-gradient-to-br from-white to-gray-50">
        {messages.map((message: Message) => (
          <div 
            key={message.id} 
            className={`flex items-start ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`
                max-w-3xl px-4 py-2 rounded-lg shadow-md
                ${message.sender === 'user' 
                  ? 'bg-gradient-to-r from-[#00F7EF] to-[#2BE7C2] text-black ml-12 shadow-[0_0_10px_rgba(0,247,239,0.2)]' 
                  : 'bg-gradient-to-r from-[#C084FC] to-[#D946EF] text-white mr-12 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                }
                ${message.isStreaming ? 'border-2 border-neon-purple/50 pulse-border' : ''}
                hover:scale-[1.01] transition-all duration-200
              `}
            >
              {message.isStreaming ? (
                <>
                  <div dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br>') }} />
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br>') }} />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat Controls */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex justify-between items-center mb-2">
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
        
        <div className="relative">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder="Type your engineering question here..."
            className="min-h-[80px] resize-none pr-12 rounded-md border border-neon-purple/30 focus:border-neon-purple focus:shadow-[0_0_8px_rgba(168,85,247,0.2)] transition-all"
            disabled={isSending || isStreaming || !activeConversationId}
          />
          <Button 
            size="icon"
            className="absolute right-2 bottom-2 bg-gradient-to-r from-[#C084FC] to-[#D946EF] text-white hover:brightness-110 hover:shadow-[0_0_8px_rgba(168,85,247,0.4)]"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isSending || isStreaming || !activeConversationId}
          >
            <Send className="h-4 w-4" />
          </Button>
          
          {(isSending || isStreaming) && (
            <div className="absolute right-14 bottom-4 text-xs text-muted-foreground">
              <div className="flex items-center">
                <div className="h-2 w-2 bg-neon-purple rounded-full mr-1 animate-pulse"></div>
                <div className="h-2 w-2 bg-neon-purple rounded-full mx-1 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="h-2 w-2 bg-neon-purple rounded-full ml-1 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
