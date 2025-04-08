
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { HomeButton } from "@/components/HomeButton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1C2A3A]">
      <div className="text-center max-w-md p-8 bg-[#25384D] border border-[#3A4D62] rounded-lg shadow-[0_0_20px_rgba(0,247,239,0.1)]">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-[#141E2A] flex items-center justify-center">
            <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-aqua to-neon-purple">404</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-4 text-[#F1F5F9]">Page Not Found</h1>
        <p className="text-[#CBD5E1] mb-8">The page you are looking for doesn't exist or has been moved.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => navigate(-1)}
            variant="outline" 
            className="border-[#3A4D62] text-[#F1F5F9] hover:bg-[#3A4D62]/30"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Button 
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-neon-aqua to-neon-purple text-black hover:brightness-110"
          >
            <Home className="mr-2 h-4 w-4" />
            Return to Command View
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
