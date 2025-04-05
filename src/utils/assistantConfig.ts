
// Assistant configuration with prompts and context prompts
export const ASSISTANTS = {
  DEFAULT: {
    id: 'asst_koI8HIazZW995Gtva0Vrxsdj',
    name: 'Default IT Assistant',
    prompt: `You are an advanced IT Engineering Assistant specialized in resolving technical issues, explaining concepts, and providing guidance on best practices in software development and IT operations.`,
    contextPrompt: `Using the full context of our previous conversation, provide a helpful response to the current query.`
  },
  CODE_REVIEW: {
    id: 'asst_DNvRDxjXyLfOUrS19Y47UXWd',
    name: 'Code Review Assistant',
    prompt: `You are an expert Code Review and Documentation Specialist who analyzes code for bugs, security issues, performance optimizations, and best practices.`,
    contextPrompt: `Consider all previous discussions and insights when reviewing the code to maintain consistency.`
  },
  DOCUMENTATION: {
    id: 'asst_DNvRDxjXyLfOUrS19Y47UXWd',
    name: 'Documentation Generation',
    prompt: `You are a Technical Documentation AI that generates clear, comprehensive documentation for code, APIs, and technical processes.`,
    contextPrompt: `Analyze the full conversation history to ensure continuity and completeness in the documentation.`
  },
  RISK_ASSESSMENT: {
    id: 'asst_nvOnVn672V8Y5jt6oL5uOnMZ',
    name: 'Risk Assessment Assistant',
    prompt: `You are an IT Security and Compliance Risk Assessment Expert who identifies potential security vulnerabilities, compliance issues, and suggests mitigation strategies.`,
    contextPrompt: `Using our previous conversations as context, provide a thorough risk assessment.`
  },
  SUMMARIZER: {
    id: 'asst_paFlSxWI8GJjq0POrDEus3w5',
    name: 'Technical Summarizer',
    prompt: `You are a Technical Summarization Assistant who creates concise, accurate summaries of technical discussions, focusing on key decisions, conclusions, and action items.`,
    contextPrompt: `Summarize the following conversation with clarity, highlighting the most important technical points and decisions.`
  },
  SEARCH: {
    id: 'asst_CQeVBcwjhcMnSeCMsVPGAUW6',
    name: 'IT Engineering Web Search Assistant',
    prompt: `You are an AI-powered IT Engineering Search Assistant who finds relevant technical information, documentation, and solutions from trusted sources.`,
    contextPrompt: `First, analyze the chat history to understand the full context, then search for the most relevant and up-to-date information.`
  },
  HELP: {
    id: 'asst_xdPa8uCiILzGm4iakfEgRBAS',
    name: 'Internal Document Search Assistant',
    prompt: `You are a Documentation Search Assistant who helps find relevant information within internal documentation and knowledge bases.`,
    contextPrompt: `First, search the internal documentation itself to find relevant information about the user's query.`
  },
  MENU: {
    id: 'asst_xdPa8uCiILzGm4iakfEgRBAS',
    name: 'Internal Document Search Assistant',
    prompt: `You are a Documentation Search Assistant who helps find relevant information within internal documentation and knowledge bases.`,
    contextPrompt: `First, search the internal documentation itself to find relevant information about the user's query.`
  },
  HISTORY: {
    id: 'asst_xdPa8uCiILzGm4iakfEgRBAS',
    name: 'Historical Chat Reference',
    prompt: `You are a Chat History Retrieval Assistant who helps find and reference previous conversations and decisions.`,
    contextPrompt: `Using our previous conversation as context, retrieve and summarize relevant historical discussions.`
  }
};

// Helper function to get assistant config by ID
export const getAssistantConfigById = (assistantId: string | null | undefined): {
  prompt: string;
  contextPrompt: string;
  name: string;
} => {
  if (!assistantId) {
    return ASSISTANTS.DEFAULT;
  }
  
  // Find the assistant config that matches the ID
  for (const key of Object.keys(ASSISTANTS)) {
    const assistant = ASSISTANTS[key as keyof typeof ASSISTANTS];
    if (assistant.id === assistantId) {
      return assistant;
    }
  }
  
  // Default if not found
  return ASSISTANTS.DEFAULT;
};
