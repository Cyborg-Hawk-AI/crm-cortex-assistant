
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Header } from "@/components/Header";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { FloatingActionBar } from "@/components/FloatingActionBar";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import UpdatePassword from "@/pages/auth/UpdatePassword";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";
import { ProjectsPageWrapper } from "@/components/projects/ProjectsPageWrapper";
import { Mindboard } from "@/components/mindboard/Mindboard";

import "./components/chat.css";

const App = () => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  }));

  // Default to "main" tab for Command View
  const [activeTab, setActiveTab] = useState("main");

  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <div className="min-h-screen bg-[#F9F9F9]">
              <Header activeTab={activeTab} setActiveTab={setActiveTab} />
              <div className="pt-[60px] pb-[70px]">
                <Routes>
                  <Route path="/login" element={<Login key="login" />} />
                  <Route path="/signup" element={<Signup key="signup" />} />
                  <Route path="/forgot-password" element={<ForgotPassword key="forgot-password" />} />
                  <Route path="/update-password" element={<UpdatePassword key="update-password" />} />
                  
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Index activeTab={activeTab} setActiveTab={setActiveTab} key={`index-${activeTab}`} />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/projects" element={<ProtectedRoute><ProjectsPageWrapper key="projects" /></ProtectedRoute>} />
                  <Route path="/projects/:projectId" element={<ProtectedRoute><ProjectsPageWrapper key="project-detail" /></ProtectedRoute>} />
                  <Route path="/projects/:projectId/tasks/:taskId" element={<ProtectedRoute><ProjectsPageWrapper key="project-task" /></ProtectedRoute>} />
                  
                  <Route path="/mindboard" element={<ProtectedRoute><Mindboard key="notebooks" /></ProtectedRoute>} />
                  
                  <Route path="*" element={<NotFound key="not-found" />} />
                </Routes>
              </div>
              <FloatingActionBar />
              <Toaster />
            </div>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
