
export interface StreamingResponse {
  success: boolean;
  content?: string;
  error?: string;
  conversationId: string;
  threadId?: string;
  isComplete: boolean;
}

export interface StreamingCallbacks {
  onStart: () => void;
  onChunk: (chunk: string) => void;
  onComplete: (fullResponse: string) => void;
  onError: (error: Error) => void;
}

// OpenAI stream event types
export type StreamEventType =
  | 'response.created'
  | 'response.in_progress'
  | 'response.failed'
  | 'response.completed'
  | 'response.output_item.added'
  | 'response.output_item.done'
  | 'response.content_part.added'
  | 'response.content_part.done'
  | 'response.output_text.delta'
  | 'response.output_text.annotation.added'
  | 'response.text.done'
  | 'response.refusal.delta'
  | 'response.refusal.done'
  | 'response.function_call.arguments.delta'
  | 'response.function_call.arguments.done'
  | 'response.file_search_call.in_progress'
  | 'response.file_search_call.searching'
  | 'response.file_search_call.completed'
  | 'response.code_interpreter.in_progress'
  | 'response.code_interpreter_call.code.delta'
  | 'response.code_interpreter_call.code.done'
  | 'response.code_interpreter_call.interpreting'
  | 'response.code_interpreter_call.completed'
  | 'error';
