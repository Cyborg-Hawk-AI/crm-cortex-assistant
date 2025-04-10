
import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const combinedRef = React.useCallback((textarea: HTMLTextAreaElement) => {
      textareaRef.current = textarea;
      if (typeof ref === 'function') {
        ref(textarea);
      } else if (ref) {
        ref.current = textarea;
      }
    }, [ref]);

    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set the height to the scrollHeight to fit all content
      textarea.style.height = `${textarea.scrollHeight}px`;
    }, []);

    // Adjust height on initial render
    React.useEffect(() => {
      adjustHeight();
    }, [adjustHeight]);

    // Adjust height when the content changes
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      adjustHeight();
      if (props.onChange) {
        props.onChange(e);
      }
    };

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-hidden",
          className
        )}
        ref={combinedRef}
        onChange={handleChange}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
