import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { TradingWidget } from '@/components/trading/TradingWidget';
import { Button } from '@/components/ui/button';
import { MatrixRain } from '@/components/ui/matrix-rain';

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/');
          return;
        }
        setUser(session.user);
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-black flex items-center justify-center">
        <MatrixRain />
        <div className="relative z-10 text-emerald-400 font-trading text-xl">
          LOADING SMARTSIGNAL PRO...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <div className="bg-black/90 border-b border-emerald-500/30 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-emerald-400 font-trading text-xl neon-text">
              🚀 SMARTSIGNAL PRO v2
            </h1>
            <div className="text-emerald-300/70 font-trading text-sm">
              Welcome, {user?.email}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 hover:bg-blue-500 font-trading"
            >
              ADMIN PANEL
            </Button>
            <Button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-500 font-trading"
            >
              SIGN OUT
            </Button>
          </div>
        </div>
      </div>

      {/* Main Trading Widget */}
      <TradingWidget />
    </div>
  );
};

export default Index;
