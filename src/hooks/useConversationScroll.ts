
import { RefObject, useEffect, useRef } from 'react';

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
  const shouldAutoScroll = useRef(true);
  const lastScrollPosition = useRef(0);
  const lastMessageCount = useRef(messages.length);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
      
      // Only update scroll state if user has moved more than 10px
      if (Math.abs(scrollTop - lastScrollPosition.current) > 10) {
        shouldAutoScroll.current = isNearBottom;
        lastScrollPosition.current = scrollTop;
        console.log(`Scroll state updated: ${shouldAutoScroll.current ? 'auto-scroll enabled' : 'auto-scroll disabled'}`);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !shouldAutoScroll.current) return;

    const hasNewMessages = messages.length > lastMessageCount.current;
    lastMessageCount.current = messages.length;

    if ((isStreaming || isSending || hasNewMessages) && shouldAutoScroll.current) {
      console.log('Auto-scrolling to bottom due to new content');
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isStreaming, isSending, containerRef]);

  const scrollToBottom = () => {
    const container = containerRef.current;
    if (!container) return;

    shouldAutoScroll.current = true;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth'
    });
    console.log('Manual scroll to bottom triggered');
  };

  return {
    scrollToBottom,
    isAutoScrollEnabled: shouldAutoScroll.current
  };
};
