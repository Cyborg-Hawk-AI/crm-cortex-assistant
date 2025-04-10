
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
import { ProjectsPage } from "@/components/projects/ProjectsPage";
import { ProjectsPageWrapper } from "@/components/projects/ProjectsPageWrapper";
import { Header } from "@/components/Header";
import { Mindboard } from "@/components/mindboard/Mindboard";
import { GlobalFooter } from "@/components/GlobalFooter";

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

  const [activeTab, setActiveTab] = useState("projects");

  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <div className="min-h-screen bg-[#171C24]">
            <Header activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="pt-[60px] pb-[112px]"> {/* Add padding to account for fixed header and footer */}
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/update-password" element={<UpdatePassword />} />
                
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                
                {/* Project Routes (formerly Missions) */}
                <Route path="/projects" element={<ProtectedRoute><ProjectsPageWrapper /></ProtectedRoute>} />
                <Route path="/projects/:projectId" element={<ProtectedRoute><ProjectsPageWrapper /></ProtectedRoute>} />
                <Route path="/projects/:projectId/tasks/:taskId" element={<ProtectedRoute><ProjectsPageWrapper /></ProtectedRoute>} />
                
                {/* Mindboard Route */}
                <Route path="/mindboard" element={<ProtectedRoute><Mindboard /></ProtectedRoute>} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <GlobalFooter />
            <Toaster />
          </div>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
