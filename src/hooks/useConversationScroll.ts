
import { RefObject, useEffect, useRef, useState } from 'react';

interface UseConversationScrollProps {
  containerRef: RefObject<HTMLElement>;
  messages: any[];
  isStreaming: boolean;
  isSending: boolean;
}

export const useConversationScroll = ({
  containerRef,
  messages,
  isStreaming,
  isSending
}: UseConversationScrollProps) => {
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const lastScrollPosition = useRef(0);
  const lastMessageCount = useRef(messages.length);
  const isInitialLoad = useRef(true);

  // Scroll detection logic - disable auto-scroll when user manually scrolls up
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
      
      // Only update scroll state if user has moved more than 10px
      if (Math.abs(scrollTop - lastScrollPosition.current) > 10) {
        setIsAutoScrollEnabled(isNearBottom);
        lastScrollPosition.current = scrollTop;
        console.log(`Scroll state updated: ${isNearBottom ? 'auto-scroll enabled' : 'auto-scroll disabled'}`);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef]);

  // Auto-scroll logic for new messages and initial load
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const hasNewMessages = messages.length > lastMessageCount.current;
    const shouldScrollToBottom = isAutoScrollEnabled || isInitialLoad.current;
    
    lastMessageCount.current = messages.length;

    if ((isStreaming || isSending || hasNewMessages || isInitialLoad.current) && shouldScrollToBottom) {
      console.log('Auto-scrolling to bottom due to new content or initial load');
      setTimeout(() => {
        if (container) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: isInitialLoad.current ? 'auto' : 'smooth'
          });
          
          if (isInitialLoad.current) {
            isInitialLoad.current = false;
          }
        }
      }, 100);
    }
  }, [messages, isStreaming, isSending, isAutoScrollEnabled]);

  const scrollToBottom = () => {
    const container = containerRef.current;
    if (!container) return;

    setIsAutoScrollEnabled(true);
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth'
    });
    console.log('Manual scroll to bottom triggered');
  };

  return {
    scrollToBottom,
    isAutoScrollEnabled
  };
};
