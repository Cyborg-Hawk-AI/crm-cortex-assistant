
import { motion } from 'framer-motion';
import { Message as MessageType } from '@/utils/types';
import { User, Bot, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useEffect, useMemo, useRef } from 'react';
import { MessageStatus } from '@/utils/streamTypes';

interface MessageProps {
  message: MessageType & {
    status?: MessageStatus;
    isOptimistic?: boolean;
  };
}

export function Message({ message }: MessageProps) {
  const isUser = message.sender === 'user';
  const isSystem = message.isSystem;
  const messageRef = useRef<HTMLDivElement>(null);
  const isSending = message.status === 'sending';
  
  // Effect to ensure user messages are immediately visible with auto-focus
  useEffect(() => {
    if (isUser && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isUser, message.id]);
  
  // Function to render markdown to safe HTML
  const renderMarkdownToSafeHtml = (content: string) => {
    // Handle empty content more gracefully
    if (!content || content.trim() === '') {
      return '<p class="text-muted-foreground">Thinking...</p>';
    }
    
    try {
      // Use marked.parse synchronously
      const html = marked.parse(content, { async: false }) as string;
      return DOMPurify.sanitize(html);
    } catch (error) {
      console.error('Error parsing markdown:', error);
      return `<p>${content}</p>`; // Fallback to original content if parsing fails
    }
  };
  
  // Format ticket content
  const formatTicketContent = (content: string) => {
    if (!content.startsWith('TICKETCONTENTS-')) return content;
    
    // Extract and format the ticket content
    const ticketContent = content.replace('TICKETCONTENTS-', '');
    
    try {
      const ticketData = JSON.parse(ticketContent);
      
      return (
        <div className="bg-secondary/50 p-3 rounded-md border border-primary/20">
          <h4 className="text-sm font-medium mb-2 text-primary">Linked Task/Ticket Details</h4>
          <div className="space-y-1">
            {Object.entries(ticketData).map(([key, value]) => (
              <div key={key} className="grid grid-cols-3 text-xs">
                <span className="font-medium text-foreground">{key}</span>
                <span className="col-span-2 text-foreground/80">{String(value) || 'N/A'}</span>
              </div>
            ))}
          </div>
        </div>
      );
    } catch (error) {
      console.error('Error parsing ticket content:', error);
      
      // Fallback to simple display if JSON parsing fails
      const lines = ticketContent.split('\n');
      
      return (
        <div className="bg-secondary/50 p-3 rounded-md border border-primary/20">
          <h4 className="text-sm font-medium mb-2 text-primary">Linked Task/Ticket Details</h4>
          <div className="space-y-1">
            {lines.map((line, index) => {
              if (!line.trim()) return null;
              
              const [key, value] = line.split(':').map(s => s.trim());
              
              return (
                <div key={index} className="grid grid-cols-3 text-xs">
                  <span className="font-medium text-foreground">{key}</span>
                  <span className="col-span-2 text-foreground/80">{value || 'N/A'}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
  };

  // Process message content with memoization for performance
  const processedContent = useMemo(() => {
    // Add debugging logs to see what message data we're receiving
    console.log(`Processing message: ${message.id}`, {
      content: message.content,
      sender: message.sender,
      status: message.status,
      isStreaming: message.isStreaming
    });

    // User messages should always render immediately even if empty
    if (isUser) {
      return <p className={cn(
        "text-sm whitespace-pre-wrap",
        isSending && "opacity-80 italic"
      )}>{message.content}</p>;
    }
    
    // For non-user messages, apply special handling
    
    // Completely skip rendering empty messages that aren't streaming
    if (!message.content && !message.isStreaming) {
      console.log(`Skipping empty message: ${message.id}, not streaming`);
      return null;
    }
    
    // Handle ticket content special case
    if (message.content && message.content.startsWith('TICKETCONTENTS-')) {
      return formatTicketContent(message.content);
    }
    
    // Special handling for streaming messages
    if (message.isStreaming) {
      // If content is empty while streaming, show thinking indicator
      if (!message.content || message.content.trim() === '') {
        return <p className="text-sm animate-pulse">Thinking...</p>;
      }
      
      // Otherwise show the partial content with a blinking cursor
      return (
        <div 
          className="text-sm markdown-content after:content-['▋'] after:ml-0.5 after:animate-blink"
          dangerouslySetInnerHTML={{
            __html: renderMarkdownToSafeHtml(message.content)
          }}
        />
      );
    }
    
    // Regular assistant/system message with content
    return (
      <div 
        className="text-sm markdown-content"
        dangerouslySetInnerHTML={{
          __html: renderMarkdownToSafeHtml(message.content)
        }}
      />
    );
  }, [message.content, message.isStreaming, message.status, isUser, isSending]);

  // For user messages, always render even if content is empty
  // For assistant messages, only render if we have content or are streaming
  if (processedContent === null && !isUser) {
    return null;
  }

  return (
    <motion.div
      ref={messageRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex',
        isUser ? 'justify-end' : 'justify-start'
      )}
      key={message.id}
    >
      <div className={cn(
        'max-w-[75%] flex gap-3',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}>
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center',
          isUser 
            ? 'bg-neon-purple text-white' 
            : 'bg-neon-purple text-white'
        )}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>
        
        <div className={cn(
          'rounded-lg px-4 py-3 text-[#F1F5F9]',
          isUser 
            ? cn(
                'bg-gradient-to-r from-[#1C2A3A] to-[#25384D] border',
                message.status === 'sending' 
                  ? 'border-neon-purple/10 opacity-80'
                  : message.status === 'error'
                  ? 'border-red-400/30'
                  : 'border-neon-purple/30'
              )
            : isSystem
              ? 'bg-[#25384D] border border-[#3A4D62]'
              : 'bg-[#25384D] border border-[#3A4D62]'
        )}>
          {processedContent}
          
          {/* Show sending indicator */}
          {message.status === 'sending' && (
            <div className="flex items-center mt-1 opacity-70 text-xs">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              <span>Sending...</span>
            </div>
          )}
          
          {/* Add error indicator */}
          {message.status === 'error' && (
            <div className="flex items-center mt-1 text-red-400 text-xs">
              <span>Failed to send. Retrying...</span>
            </div>
          )}
          
          {/* Add typing indicator when isStreaming is true but no content yet */}
          {message.isStreaming && !message.content && (
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
