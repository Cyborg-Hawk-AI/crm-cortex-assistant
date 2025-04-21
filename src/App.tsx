
import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
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

import "./App.css";

const AppContent = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("main");

  // Ensure absolute zero color mismatch for dark mode, full harmony for light mode
  useEffect(() => {
    if (theme === "dark") {
      document.body.className = "dark";
      document.body.style.background =
        "linear-gradient(120deg,#25384D 0%,#314968 40%,#2c4057 100%)";
      document.body.style.backgroundAttachment = "fixed";
      document.body.style.backgroundRepeat = "no-repeat";
      document.body.style.backgroundSize = "cover";
      document.body.style.color = "#D9E9E7"; // soft teal-gray foreground
    } else {
      document.body.className = "light";
      document.body.style.backgroundColor = "#F9F9F9";
      document.body.style.backgroundImage = "none";
      document.body.style.color = "#404040";
    }
  }, [theme]);

  return (
    <div className={`min-h-screen bg-background text-foreground transition-colors duration-300`}>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="pt-[60px] pb-[70px] bg-background">
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
  );
}

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

  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
