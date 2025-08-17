import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { MatrixRain } from "@/components/ui/matrix-rain";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      <MatrixRain />
      
      <div className="relative z-10 text-center">
        <h1 className="text-6xl font-bold mb-4 text-red-400 font-trading neon-text">
          404
        </h1>
        <p className="text-xl text-emerald-300 mb-6 font-trading">
          ACCESS DENIED - PAGE NOT FOUND
        </p>
        <p className="text-sm text-emerald-300/70 mb-8 font-trading">
          The requested resource does not exist in the system
        </p>
        <Button
          onClick={() => navigate('/')}
          className="bg-emerald-600 hover:bg-emerald-500 font-trading"
        >
          RETURN TO BASE
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
