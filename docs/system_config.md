
# System Configuration Reference

This document provides a centralized reference for all environment-specific configuration values used throughout the Actionit application. Use this guide to quickly locate where specific API keys, model configurations, and service credentials are initialized and referenced.

## 📌 API & Model Configuration

### OpenAI (ActionAlpha)

| Configuration | Value/Variable | Files |
|---------------|----------------|-------|
| API Key | Hardcoded in files: <br>`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` <br> and <br> `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` | - `src/utils/openAIStream.ts` <br> - `src/services/openaiClient.ts` |
| Default Model | `gpt-4o-mini` | - `src/utils/openAIStream.ts` |
| Assistant IDs | Default: `asst_koI8HIazZW995Gtva0Vrxsdj` <br> Code Review: `asst_DNvRDxjXyLfOUrS19Y47UXWd` <br> Documentation: `asst_DNvRDxjXyLfOUrS19Y47UXWd` <br> Risk Assessment: `asst_nvOnVn672V8Y5jt6oL5uOnMZ` <br> Summarizer: `asst_paFlSxWI8GJjq0POrDEus3w5` <br> Search: `asst_CQeVBcwjhcMnSeCMsVPGAUW6` <br> Help: `asst_xdPa8uCiILzGm4iakfEgRBAS` <br> Menu: `asst_xdPa8uCiILzGm4iakfEgRBAS` <br> History: `asst_xdPa8uCiILzGm4iakfEgRBAS` | - `src/utils/assistantConfig.ts` <br> - `src/services/openaiClient.ts` |
| API URL | `https://api.openai.com/v1` | - `src/utils/openAIStream.ts` <br> - `src/services/openaiClient.ts` |

### DeepSeek (ActionOmega)

| Configuration | Value/Variable | Files |
|---------------|----------------|-------|
| API Key | Placeholder: `YOUR_DEEPSEEK_API_KEY` | - `src/utils/deepSeekStream.ts` |
| Default Model | `deepseek-reasoner` | - `src/utils/deepSeekStream.ts` |
| API URL | `https://api.deepseek.com` | - `src/utils/deepSeekStream.ts` |

## 🛠️ AI Modes & Assistant Logic

### Assistant Configuration

Each assistant mode is configured in `src/utils/assistantConfig.ts` with the following properties:
- `id`: The OpenAI assistant ID
- `name`: Display name for the assistant
- `prompt`: System instructions for the AI
- `contextPrompt`: Instructions for context handling

### Model Selection

The application supports switching between two AI models:
- ActionAlpha (OpenAI): Default model using OpenAI's API
- ActionOmega (DeepSeek): Alternative model using DeepSeek Reasoner API

This is configured in the following files:
- `src/hooks/useModelSelection.ts` - Model selection state management
- `src/components/ModelToggle.tsx` - UI toggle component
- `src/hooks/useChatMessages.ts` - Integration with messaging system

### Assistant Types and Mappings

| Assistant Type | Assistant ID | Purpose | 
|---------------|--------------|---------|
| DEFAULT | `asst_koI8HIazZW995Gtva0Vrxsdj` | General IT Engineering Assistant |
| CODE_REVIEW | `asst_DNvRDxjXyLfOUrS19Y47UXWd` | Code review and analysis |
| DOCUMENTATION | `asst_DNvRDxjXyLfOUrS19Y47UXWd` | Technical documentation generation |
| RISK_ASSESSMENT | `asst_nvOnVn672V8Y5jt6oL5uOnMZ` | Security and compliance assessment |
| SUMMARIZER | `asst_paFlSxWI8GJjq0POrDEus3w5` | Technical discussion summarization |
| SEARCH | `asst_CQeVBcwjhcMnSeCMsVPGAUW6` | Technical information search |
| HELP | `asst_xdPa8uCiILzGm4iakfEgRBAS` | Internal documentation assistance |
| MENU | `asst_xdPa8uCiILzGm4iakfEgRBAS` | Menu assistance |
| HISTORY | `asst_xdPa8uCiILzGm4iakfEgRBAS` | Chat history reference |

### Selection and Switching Logic

The following files handle assistant selection and switching:
- `src/hooks/useChatMessages.tsx` - Core hook that manages assistant selection and messaging
- `src/hooks/useAssistantConfig.ts` - Hook for retrieving assistant configurations
- `src/services/assistantService.ts` - Service for assistant operations
- `src/hooks/useModelSelection.ts` - Hook for selecting between different AI providers

## 🔐 Supabase & Auth

### Supabase Configuration

| Configuration | Value/Variable | Files |
|---------------|----------------|-------|
| Supabase URL | `https://vmrsblqknvufwmqyguwa.supabase.co` | - `src/integrations/supabase/client.ts` <br> - `src/lib/supabase.ts` |
| Supabase Anon Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtcnNibHFrbnZ1ZndtcXlndXdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzMDEyNzgsImV4cCI6MjA1ODg3NzI3OH0.j5nqncsCWWoJeRjWOgNAvi1bsRfzdCmoMEu4u9qoSy4` | - `src/integrations/supabase/client.ts` <br> - `src/lib/supabase.ts` |
| Project ID | `vmrsblqknvufwmqyguwa` | - `src/integrations/supabase/client.ts` <br> - `src/lib/supabase.ts` |

### Authentication

Authentication is handled through Supabase Auth with the following files involved:
- `src/lib/supabase.ts` - Core authentication functions
- `src/contexts/AuthContext.tsx` - Auth state management
- `src/components/auth/LoginForm.tsx`, `src/components/auth/SignupForm.tsx` - Auth UI components

## 🌐 External Services

Currently, the application primarily relies on:
1. **OpenAI (ActionAlpha)** - For primary AI assistant functionality
2. **DeepSeek (ActionOmega)** - For alternative AI assistant functionality
3. **Supabase** - For database, authentication, and backend functions

There are no additional external services (email providers, analytics platforms, vector databases) configured at this time.

## ✅ Quick Reference: Where to Update Configuration Values

### If you want to update OpenAI API Key (ActionAlpha)
- Update in `src/utils/openAIStream.ts` - Variable: `OPENAI_API_KEY`
- Update in `src/services/openaiClient.ts` - Variable: `HARDCODED_API_KEY`

### If you want to update DeepSeek API Key (ActionOmega)
- Update in `src/utils/deepSeekStream.ts` - Variable: `DEEPSEEK_API_KEY`

### If you want to update OpenAI Assistant IDs
- Update in `src/utils/assistantConfig.ts` - Object: `ASSISTANTS`
- Update in `src/services/openaiClient.ts` - Variable: `DEFAULT_ASSISTANT_ID`

### If you want to update OpenAI Model
- Update in `src/utils/openAIStream.ts` - Variable: `DEFAULT_MODEL`
- Update in `src/services/openaiClient.ts` - When calling the API (various functions)

### If you want to update DeepSeek Model
- Update in `src/utils/deepSeekStream.ts` - Variable: `DEFAULT_MODEL`

### If you want to update Supabase Configuration
- Update in `src/integrations/supabase/client.ts` - Variables: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`
- Update in `src/lib/supabase.ts` - Variables: `supabaseUrl`, `supabaseAnonKey`

## Best Practices

1. **Centralize Configuration** - Consider moving hardcoded values to environment variables or a central configuration file
2. **Secure API Keys** - Avoid hardcoding API keys in the codebase; use secure storage methods
3. **Version Control** - Keep this document updated as new configurations are added or modified
4. **Error Handling** - Ensure robust error handling for failed API connections or misconfigured services

