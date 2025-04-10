
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";

import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import UpdatePassword from "@/pages/auth/UpdatePassword";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MissionsPage } from "@/components/mission/MissionsPage";
import { ProjectsPageWrapper } from "@/components/projects/ProjectsPageWrapper";

function App() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            
            {/* Mission Routes */}
            <Route path="/missions" element={<ProtectedRoute><MissionsPage /></ProtectedRoute>} />
            <Route path="/missions/:missionId" element={<ProtectedRoute><MissionsPage /></ProtectedRoute>} />
            <Route path="/missions/:missionId/tasks/:taskId" element={<ProtectedRoute><MissionsPage /></ProtectedRoute>} />
            
            {/* Project Routes */}
            <Route path="/projects" element={<ProtectedRoute><ProjectsPageWrapper /></ProtectedRoute>} />
            <Route path="/projects/:projectId" element={<ProtectedRoute><ProjectsPageWrapper /></ProtectedRoute>} />
            <Route path="/projects/:projectId/tasks/:taskId" element={<ProtectedRoute><ProjectsPageWrapper /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
