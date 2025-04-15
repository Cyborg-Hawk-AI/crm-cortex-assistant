# Security Concerns and Migration Strategy for API Keys and Secrets

## Current Security Concerns

### 1. Hardcoded API Keys and Secrets

#### Supabase Configuration
- **Location**: Multiple files contain hardcoded Supabase credentials
  - `src/integrations/supabase/client.ts`
  - `src/lib/supabase.ts`
  - `supabase/config.toml`
- **Exposed Values**:
  - Supabase URL
  - Supabase Anon Key
  - Project ID
- **Risk Level**: High
  - These credentials should never be exposed in source code
  - Could allow unauthorized access to your database

#### OpenAI API Keys
- **Location**: 
  - `src/services/openaiClient.ts`
  - `src/utils/openAIStream.ts`
- **Exposed Values**:
  - Multiple OpenAI API keys marked as "HARDCODED_API_KEY"
- **Risk Level**: Critical
  - These keys could be used to make unauthorized API calls
  - Could result in unexpected charges or abuse

#### DeepSeek API Key
- **Location**: `src/utils/deepSeekStream.ts`
- **Exposed Values**:
  - DeepSeek API key
- **Risk Level**: High
  - Could allow unauthorized access to DeepSeek services

#### Other API Keys
- **Location**: `supabase/functions/create-meeting-bot/index.ts`
- **Exposed Values**:
  - Recall.ai API key
- **Risk Level**: High
  - Could allow unauthorized access to meeting recording services

### 2. Security Implications

1. **Source Code Exposure**
   - Keys are visible to anyone with access to the repository
   - Keys remain in git history even if removed
   - Keys could be discovered through code search tools

2. **Unauthorized Access**
   - Exposed keys could be used by malicious actors
   - Could lead to data breaches or service abuse
   - Could result in unexpected charges

3. **Compliance Issues**
   - May violate security policies and compliance requirements
   - Could lead to audit failures
   - May violate terms of service for API providers

## Migration Strategy to AWS EC2

### 1. AWS Secrets Manager Implementation

#### Setup Process
1. **Create Secrets in AWS Secrets Manager**
   ```bash
   # Example commands to create secrets
   aws secretsmanager create-secret \
       --name "/prod/supabase/credentials" \
       --secret-string '{"url":"your-supabase-url","anonKey":"your-anon-key"}'

   aws secretsmanager create-secret \
       --name "/prod/openai/api-key" \
       --secret-string '{"key":"your-openai-key"}'

   aws secretsmanager create-secret \
       --name "/prod/deepseek/api-key" \
       --secret-string '{"key":"your-deepseek-key"}'
   ```

2. **IAM Role Configuration**
   - Create an IAM role for EC2 instance
   - Attach policy allowing access to Secrets Manager
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Effect": "Allow",
               "Action": [
                   "secretsmanager:GetSecretValue"
               ],
               "Resource": [
                   "arn:aws:secretsmanager:region:account-id:secret:/prod/*"
               ]
           }
       ]
   }
   ```

### 2. Code Changes Required

#### Environment Configuration
1. **Create Environment Variables**
   ```typescript
   // src/config/environment.ts
   import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

   const secretsManager = new SecretsManagerClient({ region: process.env.AWS_REGION });

   export const getSecret = async (secretName: string) => {
     try {
       const response = await secretsManager.send(
         new GetSecretValueCommand({ SecretId: secretName })
       );
       return JSON.parse(response.SecretString || '{}');
     } catch (error) {
       console.error(`Error retrieving secret ${secretName}:`, error);
       throw error;
     }
   };
   ```

2. **Update Supabase Client**
   ```typescript
   // src/integrations/supabase/client.ts
   import { getSecret } from '@/config/environment';

   export const initializeSupabase = async () => {
     const { url, anonKey } = await getSecret('/prod/supabase/credentials');
     return createClient<Database>(url, anonKey, {
       auth: {
         persistSession: true,
         autoRefreshToken: true,
         detectSessionInUrl: true
       }
     });
   };
   ```

3. **Update OpenAI Client**
   ```typescript
   // src/services/openaiClient.ts
   import { getSecret } from '@/config/environment';

   export const getOpenAIApiKey = async (): Promise<string> => {
     const { key } = await getSecret('/prod/openai/api-key');
     return key;
   };
   ```

### 3. Deployment Process

1. **EC2 Instance Setup**
   - Launch EC2 instance with the configured IAM role
   - Install necessary dependencies
   - Configure environment variables

2. **Application Deployment**
   - Deploy application code
   - Ensure no sensitive data in codebase
   - Verify environment variables are properly set

3. **Testing**
   - Verify secrets are properly retrieved
   - Test all API integrations
   - Monitor for any security issues

### 4. Security Best Practices

1. **Key Rotation**
   - Implement regular key rotation
   - Use AWS Secrets Manager rotation feature
   - Monitor for unauthorized access

2. **Access Control**
   - Implement least privilege principle
   - Use IAM roles and policies
   - Monitor access patterns

3. **Monitoring and Logging**
   - Enable AWS CloudTrail
   - Monitor Secrets Manager access
   - Set up alerts for suspicious activity

4. **Backup and Recovery**
   - Regular backups of secrets
   - Document recovery procedures
   - Test recovery process

## Migration Timeline

1. **Phase 1: Preparation (1-2 weeks)**
   - Create AWS Secrets Manager entries
   - Update code to use environment variables
   - Test locally with mock secrets

2. **Phase 2: Implementation (1 week)**
   - Set up EC2 instance
   - Deploy updated application
   - Verify functionality

3. **Phase 3: Cleanup (1 week)**
   - Remove hardcoded keys from codebase
   - Update documentation
   - Train team on new procedures

## Post-Migration Checklist

- [ ] All hardcoded keys removed from codebase
- [ ] Secrets properly stored in AWS Secrets Manager
- [ ] IAM roles and policies configured
- [ ] Monitoring and alerting set up
- [ ] Documentation updated
- [ ] Team trained on new procedures
- [ ] Backup and recovery procedures tested
- [ ] Security audit completed

## Additional Security Recommendations

1. **Code Scanning**
   - Implement pre-commit hooks to prevent committing secrets
   - Use tools like git-secrets or truffleHog
   - Regular security scanning of codebase

2. **Network Security**
   - Use VPC for EC2 instance
   - Implement security groups
   - Use private subnets where possible

3. **Application Security**
   - Implement rate limiting
   - Use HTTPS everywhere
   - Regular security updates

4. **Compliance**
   - Regular security audits
   - Documentation of security measures
   - Compliance with relevant standards

## Emergency Procedures

1. **Key Compromise**
   - Immediately rotate affected keys
   - Investigate source of compromise
   - Update security measures

2. **Service Outage**
   - Follow backup procedures
   - Contact AWS support if needed
   - Document incident and response

3. **Data Breach**
   - Follow incident response plan
   - Notify affected parties
   - Implement additional security measures 
