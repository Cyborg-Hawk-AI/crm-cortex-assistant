
# System Configuration Reference

This document provides a comprehensive overview of all environment-specific configuration values used throughout the Actionit application, including their locations and purposes.

## 📌 API & Model Configuration

### OpenAI

| Configuration | Value | Description | Referenced In |
|---------------|-------|-------------|--------------|
| API Key | `OPENAI_API_KEY` or hardcoded in `openaiClient.ts` | OpenAI API authentication key | `src/services/openaiClient.ts`, `src/utils/openAIStream.ts` |
| Default Assistant ID | `asst_koI8HIazZW995Gtva0Vrxsdj` | Default assistant for general interactions | `src/services/openaiClient.ts`, `src/utils/assistantConfig.ts` |
| Model Name | `gpt-4-turbo`, `gpt-4o` | Default model used for OpenAI requests | `src/utils/openAIStream.ts` |
| Assistant Brand Name | `ActionAlpha` | Branded name for OpenAI-powered assistant | `src/hooks/useModelSelection.ts` |

### Deepseek

| Configuration | Value | Description | Referenced In |
|---------------|-------|-------------|--------------|
| API Key | `DEEPSEEK_API_KEY` or placeholder | Deepseek API authentication key | `src/services/deepseekClient.ts`, `src/utils/openAIStream.ts` |
| Model Name | `deepseek-reasoner` | Model used for Deepseek requests | `src/services/deepseekClient.ts` |
| Assistant Brand Name | `ActionOmega` | Branded name for Deepseek-powered assistant | `src/hooks/useModelSelection.ts` |

## 🛠️ AI Modes & Assistant Logic

### Assistant Configuration Mapping

| Assistant Type | ID | Name | Description | Used In |
|---------------|-----|------|-------------|---------|
| DEFAULT | `asst_koI8HIazZW995Gtva0Vrxsdj` | Default IT Assistant | General-purpose IT assistance | `src/utils/assistantConfig.ts` |
| CODE_REVIEW | `asst_DNvRDxjXyLfOUrS19Y47UXWd` | Code Review Assistant | Analysis of code quality and issues | `src/utils/assistantConfig.ts` |
| DOCUMENTATION | `asst_DNvRDxjXyLfOUrS19Y47UXWd` | Documentation Generation | Creates technical documentation | `src/utils/assistantConfig.ts` |
| RISK_ASSESSMENT | `asst_nvOnVn672V8Y5jt6oL5uOnMZ` | Risk Assessment Assistant | Security and compliance evaluation | `src/utils/assistantConfig.ts` |
| SUMMARIZER | `asst_paFlSxWI8GJjq0POrDEus3w5` | Technical Summarizer | Creates summaries of technical content | `src/utils/assistantConfig.ts` |
| SEARCH | `asst_CQeVBcwjhcMnSeCMsVPGAUW6` | IT Engineering Web Search Assistant | Finds technical information | `src/utils/assistantConfig.ts` |
| HELP | `asst_xdPa8uCiILzGm4iakfEgRBAS` | Internal Document Search Assistant | Searches internal documentation | `src/utils/assistantConfig.ts` |
| MENU | `asst_xdPa8uCiILzGm4iakfEgRBAS` | Internal Document Search Assistant | Navigation and menu assistance | `src/utils/assistantConfig.ts` |
| HISTORY | `asst_xdPa8uCiILzGm4iakfEgRBAS` | Historical Chat Reference | Retrieves conversation history | `src/utils/assistantConfig.ts` |

### Model Selection Logic

Model selection is managed through the `useModelSelection` hook in `src/hooks/useModelSelection.ts`. This hook provides functions to:

- Switch between different AI models (OpenAI and Deepseek)
- Associate each model with a branded assistant name (ActionAlpha or ActionOmega)
- Store and retrieve API keys for different providers
- Update conversations with the selected model provider

The component that facilitates model switching is `src/components/ModelSelector.tsx`.

## 🔐 Supabase & Auth Configuration

| Configuration | Value | Description | Referenced In |
|---------------|-------|-------------|--------------|
| Supabase URL | `https://vmrsblqknvufwmqyguwa.supabase.co` | Endpoint for Supabase API | `src/lib/supabase.ts`, `src/integrations/supabase/client.ts` |
| Supabase Anon Key | `eyJhbGci...` | Public API key for anonymous Supabase access | `src/lib/supabase.ts`, `src/integrations/supabase/client.ts` |
| Project ID | `vmrsblqknvufwmqyguwa` | Supabase project identifier | `supabase/config.toml` |

Authentication functionality is implemented using Supabase's authentication services, with helper functions in:
- `src/lib/supabase.ts` - Core authentication functions and profile management
- `src/utils/auth.ts` - Authentication utility functions
- `src/contexts/AuthContext.tsx` - React context for application-wide auth state

## 🌐 External Services

Currently, no external services beyond OpenAI, Deepseek, and Supabase are explicitly configured in the codebase. The application is designed to be extended with additional integrations as needed.

## Update Guidance

When adding new environment variables, API keys, or configuration values:

1. Always place constants in appropriate configuration files rather than hardcoding them in functional components
2. Update this document to reflect new dependencies
3. Consider creating adapter patterns for new AI providers similar to those used for OpenAI and Deepseek
4. When possible, use Supabase secrets for storing sensitive values rather than hardcoded strings

## Security Considerations

- API keys should ideally be stored in Supabase secrets or environment variables, not hardcoded
- Current implementation includes some hardcoded API keys which should be migrated to secure storage
- User-provided API keys should be encrypted when stored in the database
