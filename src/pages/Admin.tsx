import { AdminPanel } from "@/components/admin/AdminPanel";
import { MatrixRain } from "@/components/ui/matrix-rain";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AdminPage = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <MatrixRain />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-black/90 border-b border-red-500/30 p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-red-400 font-trading neon-text">
                🛡️ ADMIN CONTROL PANEL
              </h1>
              <p className="text-red-300/70 text-sm font-trading">
                SYSTEM ADMINISTRATOR ACCESS
              </p>
            </div>
            
            <div className="flex gap-4">
              <Button
                onClick={() => navigate('/trading')}
                className="bg-emerald-600 hover:bg-emerald-500 font-trading"
              >
                TRADING SIGNALS
              </Button>
              
              <Button
                onClick={handleSignOut}
                variant="destructive"
                className="bg-red-900/50 border-red-500/50 text-red-300 hover:bg-red-800/50 font-trading"
              >
                LOGOUT
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4">
          <div className="max-w-7xl mx-auto">
            <AdminPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
