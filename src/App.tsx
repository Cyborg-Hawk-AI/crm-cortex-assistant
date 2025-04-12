
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ChatLayout } from '@/components/ChatLayout';
import LoginPage from '@/pages/auth/Login';
import SignupPage from '@/pages/auth/Signup';
import ForgotPasswordPage from '@/pages/auth/ForgotPassword';
import UpdatePasswordPage from '@/pages/auth/UpdatePassword';
import Index from '@/pages/Index'; // Use Index page instead of Dashboard
import AuthCallbackPage from './pages/auth/Callback';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a new client
const queryClient = new QueryClient();

function App() {
  return (
    // Router must wrap AuthProvider since useNavigate is used in AuthContext
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/update-password" element={<UpdatePasswordPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatLayout />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
