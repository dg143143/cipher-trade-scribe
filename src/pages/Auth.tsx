import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { MatrixRain } from '@/components/ui/matrix-rain';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { session, isAdmin, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      if (isAdmin) {
        navigate('/admin');
      } else if (session) {
        navigate('/trading');
      }
    }
  }, [session, isAdmin, authLoading, navigate]);

  const cleanupAuthState = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  const handleUserSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast.success('Login successful!');
        // The useEffect hook will handle redirection.
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password: password || 'DG143', // Default password for admin
        options: {
          emailRedirectTo: `${window.location.origin}/trading`,
          data: {
            full_name: username || email.split('@')[0],
            username: username || email.split('@')[0]
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // If the admin user is being created, assign the admin role.
        if (data.user.email === 'admin@smartsignal.pro') {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({ user_id: data.user.id, role: 'admin' });

          if (roleError) throw roleError;
          toast.success('Admin account created successfully! Please log in.');
        } else {
          toast.success('Account created! Please check your email for verification.');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <MatrixRain />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/90 border-2 border-emerald-500/50 shadow-2xl shadow-emerald-500/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-emerald-400 neon-text font-trading">
              SMARTSIGNAL PRO v2
            </CardTitle>
            <p className="text-emerald-300/70 text-sm font-trading">
              ELITE AI TRADING SYSTEM
            </p>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-emerald-950/30">
                <TabsTrigger value="signin" className="data-[state=active]:bg-emerald-500/20 text-emerald-300/70 font-trading text-xs">
                  SIGN IN
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-emerald-500/20 text-emerald-300/70 font-trading text-xs">
                  REGISTER
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleUserSignIn} className="space-y-4 mt-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-black/70 border-emerald-500/50 text-emerald-100 placeholder-emerald-300/50 font-trading"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-black/70 border-emerald-500/50 text-emerald-100 placeholder-emerald-300/50 font-trading"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-bold font-trading tracking-wider border border-emerald-400 shadow-lg shadow-emerald-500/30"
                  >
                    {loading ? 'AUTHENTICATING...' : 'LOGIN'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleUserSignUp} className="space-y-4 mt-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="Username (Optional)"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-black/70 border-emerald-500/50 text-emerald-100 placeholder-emerald-300/50 font-trading"
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-black/70 border-emerald-500/50 text-emerald-100 placeholder-emerald-300/50 font-trading"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Password (defaults to DG143 for admin)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-black/70 border-emerald-500/50 text-emerald-100 placeholder-emerald-300/50 font-trading"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-bold font-trading tracking-wider border border-emerald-400 shadow-lg shadow-emerald-500/30"
                  >
                    {loading ? 'CREATING ACCOUNT...' : 'REGISTER'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;