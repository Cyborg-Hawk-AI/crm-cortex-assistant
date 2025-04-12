
# Google Authentication Setup Guide

This document provides step-by-step instructions to add Google Authentication to our Actionit app using Supabase Auth.

## Prerequisites

- Access to the Supabase dashboard for our project
- A Google Cloud Platform (GCP) account
- Basic understanding of OAuth 2.0 authentication flow

## 1. Configure Google Cloud Platform

### 1.1 Create a new project in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down the Project ID for later use

### 1.2 Configure the OAuth consent screen

1. In the GCP Console, go to **APIs & Services > OAuth consent screen**
2. Select the appropriate User Type (External or Internal)
3. Fill in the required application information:
   - App name: `Actionit`
   - User support email: Your support email
   - Authorized domains: Add your Supabase project domain (`[project-id].supabase.co`)
   - Developer contact information: Your contact email
4. Add the following scopes:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
5. Click "Save and Continue" through the remaining steps

### 1.3 Create OAuth 2.0 Client ID

1. Go to **APIs & Services > Credentials**
2. Click "Create Credentials" and select "OAuth client ID"
3. Application type: **Web application**
4. Name: `Actionit Web Client`
5. Authorized JavaScript origins: 
   - Add your development URL (e.g., `http://localhost:5173`)
   - Add your production URL when ready
6. Authorized redirect URIs:
   - Add: `https://[project-id].supabase.co/auth/v1/callback`
   - Add: `[your-app-domain]/auth/callback` (for production)
   - Add: `http://localhost:5173/auth/callback` (for development)
7. Click "Create"
8. Note down the **Client ID** and **Client Secret** that are generated

## 2. Configure Supabase Auth

### 2.1 Set up Google provider in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication > Providers**
4. Find Google in the list and click "Edit"
5. Enable the provider by toggling the switch
6. Enter the **Client ID** and **Client Secret** from the previous step
7. Set up the authorized redirect URL:
   - This should match the redirect URL you added in Google Console
   - Format: `https://[project-id].supabase.co/auth/v1/callback`
8. Click "Save"

### 2.2 Configure site URL and redirect URLs

1. Go to **Authentication > URL Configuration**
2. Set the Site URL to your application's domain
   - Development: `http://localhost:5173`
   - Production: `[your-app-domain]`
3. Add redirect URLs:
   - `http://localhost:5173/auth/callback` (for development)
   - `[your-app-domain]/auth/callback` (for production)
4. Click "Save"

## 3. Frontend Implementation

Our frontend code has already been updated to include Google Authentication. Here's an overview of the changes:

### 3.1 Updated Components

1. **LoginForm.tsx** and **SignupForm.tsx**:
   - Added "Continue with Google" and "Sign up with Google" buttons
   - Implemented OAuth sign-in handlers
   - Added loading states for Google authentication

2. **AuthCallback.tsx**:
   - Created a callback page that handles OAuth redirects
   - Processes authentication responses
   - Redirects users appropriately based on auth status

### 3.2 App Routing

Ensure the callback route is registered in the application router:

```jsx
// Add this to your router configuration
<Route path="/auth/callback" element={<AuthCallbackPage />} />
```

## 4. Testing the Integration

1. Start your development server
2. Navigate to the login or signup page
3. Click the Google authentication button
4. Complete the Google OAuth flow
5. Verify that you're redirected back to the application and logged in

## 5. Troubleshooting

### 5.1 Common Issues

- **"Error: Invalid redirect URI"**: Ensure the redirect URI in both Google Cloud Console and Supabase settings match exactly.
- **"Error: requested path is invalid"**: Check that the Site URL in Supabase auth settings is correctly configured.
- **Redirect loops**: Verify that the callback handler properly detects authentication state.

### 5.2 Testing Tips

- Use incognito/private browsing to test the authentication flow without cached credentials
- Check browser console for detailed error messages
- Monitor Supabase authentication logs in the dashboard
- Verify that your app is correctly handling token storage and session management

### 5.3 Credentials Security

- **NEVER** commit client secrets to your repository
- For local development, use environment variables to store sensitive information
- For production, use Supabase Edge Functions secrets or similar secure storage

## 6. Best Practices

- Always implement proper error handling for auth failures
- Add loading indicators during authentication to improve UX
- Consider implementing refresh token rotation for enhanced security
- Regularly audit and update your OAuth credentials
- Test the flow on different browsers and devices
- Implement proper sign-out handling that clears tokens from all storage locations

## 7. Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 for Web Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [OAuth 2.0 Security Best Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics-16)

## 8. Next Steps

- Consider adding other OAuth providers like GitHub, Microsoft, etc.
- Implement additional profile data synchronization from OAuth providers
- Set up role-based access control using Supabase RLS policies
- Create a unified auth state management system for multi-provider support
