
import React, { useState, useEffect } from 'react';
import { Header } from "@/components/Header";
import { FloatingActionBar } from "@/components/FloatingActionBar";
import { useTheme } from "@/contexts/ThemeContext";
import Index from "@/pages/Index";

export function ExtensionLayout() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Apply theme styling
  useEffect(() => {
    if (theme === "dark") {
      document.body.className = "dark";
      document.body.style.background = 
        "linear-gradient(120deg,#25384D 0%,#314968 40%,#2c4057 100%)";
      document.body.style.backgroundAttachment = "fixed";
      document.body.style.backgroundRepeat = "no-repeat";
      document.body.style.backgroundSize = "cover";
      document.body.style.color = "#D9E9E7"; 
    } else {
      document.body.className = "light";
      document.body.style.backgroundColor = "#F9F9F9";
      document.body.style.backgroundImage = "none";
      document.body.style.color = "#404040";
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="pt-[60px] pb-[70px] bg-background extension-content">
        <Index activeTab={activeTab} setActiveTab={setActiveTab} key={`index-${activeTab}`} />
      </div>
      <FloatingActionBar />
    </div>
  );
}
