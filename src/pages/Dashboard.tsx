import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { TradingWidget } from '@/components/trading/TradingWidget';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MatrixRain } from '@/components/ui/matrix-rain';
import { User } from '@supabase/supabase-js';

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string>('user');
  const [loading, setLoading] = useState(true);
  const [showTrading, setShowTrading] = useState(true);
  const navigate = useNavigate();

  const checkAuthAndRole = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/');
        return;
      }

      setUser(session.user);

      // Check user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (roleData) {
        setUserRole(roleData.role);
      }

      setLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    checkAuthAndRole();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, checkAuthAndRole]);

  const handleSignOut = async () => {
    try {
      // Clean up auth state
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });

      await supabase.auth.signOut({ scope: 'global' });
      toast.success('Logged out successfully');
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      window.location.href = '/';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        <MatrixRain />
        <div className="relative z-10 text-emerald-400 font-trading text-xl">
          LOADING SYSTEM...
        </div>
      </div>
    );
  }

  const isAdmin = userRole === 'admin';

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <MatrixRain />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-black/90 border-b border-emerald-500/30 p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-emerald-400 font-trading neon-text">
                SMARTSIGNAL PRO v2 - DASHBOARD
              </h1>
              <p className="text-emerald-300/70 text-sm font-trading">
                Welcome, {user?.user_metadata?.username || user?.email} 
                {isAdmin && <span className="text-red-400 ml-2">[ADMIN]</span>}
              </p>
            </div>
            
            <div className="flex gap-4">
              <Button
                onClick={() => navigate('/trading')}
                className="bg-emerald-600 hover:bg-emerald-500 font-trading"
              >
                TRADING SIGNALS
              </Button>
              {isAdmin && (
                <>
                  <Button
                    onClick={() => setShowTrading(!showTrading)}
                    variant="outline"
                    className="bg-emerald-900/50 border-emerald-500/50 text-emerald-300 hover:bg-emerald-800/50 font-trading"
                  >
                    {showTrading ? 'ADMIN PANEL' : 'TRADING VIEW'}
                  </Button>
                </>
              )}
              
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
            {isAdmin && !showTrading ? (
              <AdminPanel />
            ) : (
              <div className="bg-black/80 border border-emerald-500/30 rounded-lg p-6">
                <TradingWidget />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;