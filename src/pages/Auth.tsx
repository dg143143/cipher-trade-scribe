import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { MatrixRain } from '@/components/ui/matrix-rain';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };
    checkAuth();
  }, [navigate]);

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

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (username === 'DG143' && password === 'DG143') {
        // Admin login with special credentials
        cleanupAuthState();
        
        // Create or get admin user
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'admin@smartsignal.pro',
          password: 'DG143Admin2024!'
        });

        if (signInError && signInError.message.includes('Invalid login credentials')) {
          // Create admin account if it doesn't exist
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: 'admin@smartsignal.pro',
            password: 'DG143Admin2024!',
            options: {
              emailRedirectTo: `${window.location.origin}/dashboard`,
              data: {
                full_name: 'System Administrator',
                username: 'DG143'
              }
            }
          });

          if (signUpError) throw signUpError;
          
          if (signUpData.user) {
            toast.success('Admin account created and logged in!');
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 1000);
          }
        } else if (signInError) {
          throw signInError;
        } else {
          toast.success('Admin login successful!');
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1000);
        }
      } else {
        throw new Error('Invalid admin credentials');
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
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
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
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
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: username || email.split('@')[0],
            username: username || email.split('@')[0]
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        toast.success('Account created! Please check your email for verification.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
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
            <Tabs defaultValue="user" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-emerald-950/50 border border-emerald-500/30">
                <TabsTrigger 
                  value="user" 
                  className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 text-emerald-300/70 font-trading"
                >
                  USER ACCESS
                </TabsTrigger>
                <TabsTrigger 
                  value="admin" 
                  className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 text-emerald-300/70 font-trading"
                >
                  ADMIN ACCESS
                </TabsTrigger>
              </TabsList>

              <TabsContent value="user" className="space-y-4 mt-6">
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
                        {loading ? 'CREATING ACCOUNT...' : 'REGISTER'}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="admin" className="space-y-4 mt-6">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="Admin Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-red-950/70 border-red-500/50 text-red-100 placeholder-red-300/50 font-trading"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Admin Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-red-950/70 border-red-500/50 text-red-100 placeholder-red-300/50 font-trading"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-bold font-trading tracking-wider border border-red-400 shadow-lg shadow-red-500/30"
                  >
                    {loading ? 'AUTHENTICATING...' : 'ADMIN LOGIN'}
                  </Button>
                  <p className="text-xs text-red-300/70 text-center font-trading">
                    Default credentials: DG143 / DG143
                  </p>
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