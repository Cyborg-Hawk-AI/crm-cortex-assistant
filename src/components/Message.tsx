
import { motion } from 'framer-motion';
import { Message as MessageType } from '@/utils/types';
import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useMemo } from 'react';

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const isUser = message.sender === 'user';
  const isSystem = message.isSystem;
  
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
    // Completely skip rendering empty messages
    if (!message.content && !message.isStreaming) {
      return null;
    }
    
    // Handle ticket content special case
    if (message.content && message.content.startsWith('TICKETCONTENTS-')) {
      return formatTicketContent(message.content);
    }
    
    // Only apply markdown parsing to assistant and system messages
    if (isUser) {
      return <p className="text-sm whitespace-pre-wrap">{message.content}</p>;
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
  }, [message.content, message.isStreaming, isUser]);

  // If processedContent is null, don't render the message at all
  if (processedContent === null) {
    return null;
  }

  return (
    <motion.div
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
            ? 'bg-neon-aqua text-[#111827]' 
            : 'bg-neon-purple text-[#111827]'
        )}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>
        
        <div className={cn(
          'rounded-lg px-4 py-3 shadow-md',
          isUser 
            ? 'bg-gradient-to-r from-neon-aqua to-neon-aqua/80 text-[#111827]' 
            : isSystem
              ? 'bg-gradient-to-r from-neon-purple to-neon-purple/80 text-foreground border border-border/30'
              : 'bg-gradient-to-r from-neon-purple/70 to-neon-purple/50 text-foreground border border-border/30'
        )}>
          {processedContent}
        </div>
      </div>
    </motion.div>
  );
}

