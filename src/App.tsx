
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ChatLayout } from '@/components/ChatLayout';
import LoginPage from '@/pages/auth/Login';
import SignupPage from '@/pages/auth/Signup';
import ForgotPasswordPage from '@/pages/auth/ForgotPassword';
import UpdatePasswordPage from '@/pages/auth/UpdatePassword';
import Index from '@/pages/Index'; // Changed from DashboardPage to Index
import AuthCallbackPage from './pages/auth/Callback';

function App() {
  return (
    <AuthProvider>
      <Router>
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
                <Index /> {/* Changed from DashboardPage to Index */}
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
      </Router>
    </AuthProvider>
  );
}

export default App;
