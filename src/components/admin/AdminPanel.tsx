import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { tradingSignalsService } from '@/services/tradingSignalsService';

interface UserData {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  status?: string;
  approved_by?: string;
  approved_at?: string;
  user_roles?: {
    role: string;
  }[];
}

interface TradingSignal {
  id: string;
  symbol: string;
  signal_type: string;
  entry_price: number;
  confidence_level: string;
  created_at: string;
  profiles?: {
    email: string;
    full_name?: string;
  };
}

export const AdminPanel = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string>('');
  const [createUserDialog, setCreateUserDialog] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'signals'>('users');

  useEffect(() => {
    fetchUsers();
    fetchSignals();
  }, []);

  const fetchUsers = async () => {
    try {
      // Get all profiles with role information
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;

      // Get user roles separately
      const usersWithRoles = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id);

          return {
            ...profile,
            user_roles: roles || []
          };
        })
      );

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast.error('Failed to fetch users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserAccess = async (userId: string, isActive: boolean) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase.rpc('toggle_user_access', {
        _user_id: userId,
        _active: !isActive
      });

      if (error) throw error;

      toast.success(`User ${!isActive ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (error: any) {
      toast.error('Action failed: ' + error.message);
    } finally {
      setActionLoading('');
    }
  };

  const makeUserAdmin = async (userId: string) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase.rpc('make_user_admin', {
        _user_id: userId
      });

      if (error) throw error;

      toast.success('User promoted to admin successfully');
      fetchUsers();
    } catch (error: any) {
      toast.error('Failed to promote user: ' + error.message);
    } finally {
      setActionLoading('');
    }
  };

  const removeAdminRole = async (userId: string) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase.rpc('remove_admin_role', {
        _user_id: userId
      });

      if (error) throw error;

      toast.success('Admin role removed successfully');
      fetchUsers();
    } catch (error: any) {
      toast.error('Failed to remove admin role: ' + error.message);
    } finally {
      setActionLoading('');
    }
  };

  const fetchSignals = async () => {
    try {
      const { data, error } = await tradingSignalsService.getAllSignals();
      if (error) throw new Error(error);
      setSignals(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch signals: ' + error.message);
    }
  };

  const createUser = async () => {
    if (!newUserEmail || !newUserPassword) {
      toast.error('Email and password are required');
      return;
    }

    setActionLoading('create');
    try {
      const { data, error } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
        options: {
          data: {
            full_name: newUserName || newUserEmail.split('@')[0]
          }
        }
      });

      if (error) throw error;

      toast.success('User created successfully');
      setCreateUserDialog(false);
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserName('');
      fetchUsers();
    } catch (error: any) {
      toast.error('Failed to create user: ' + error.message);
    } finally {
      setActionLoading('');
    }
  };

  const approveUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase.rpc('approve_user', {
        _user_id: userId
      });

      if (error) throw error;

      toast.success('User approved successfully');
      fetchUsers();
    } catch (error: any) {
      toast.error('Failed to approve user: ' + error.message);
    } finally {
      setActionLoading('');
    }
  };

  const rejectUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase.rpc('reject_user', {
        _user_id: userId
      });

      if (error) throw error;

      toast.success('User rejected successfully');
      fetchUsers();
    } catch (error: any) {
      toast.error('Failed to reject user: ' + error.message);
    } finally {
      setActionLoading('');
    }
  };

  const removeUser = async (userId: string) => {
    if (!confirm('Are you sure you want to permanently remove this user? This action cannot be undone.')) {
      return;
    }

    setActionLoading(userId);
    try {
      const { error } = await supabase.rpc('remove_user', {
        _user_id: userId
      });

      if (error) throw error;

      toast.success('User removed successfully');
      fetchUsers();
    } catch (error: any) {
      toast.error('Failed to remove user: ' + error.message);
    } finally {
      setActionLoading('');
    }
  };

  const getUserRole = (user: UserData) => {
    return user.user_roles?.[0]?.role || 'none';
  };

  const getUserStatus = (user: UserData) => {
    return user.status || 'pending';
  };

  const isUserActive = (user: UserData) => {
    return user.user_roles?.some(role => role.role === 'user') || false;
  };

  const isUserAdmin = (user: UserData) => {
    return user.user_roles?.some(role => role.role === 'admin') || false;
  };

  const getPendingUsers = () => {
    return users.filter(user => getUserStatus(user) === 'pending');
  };

  const getApprovedUsers = () => {
    return users.filter(user => getUserStatus(user) === 'approved');
  };

  const getRejectedUsers = () => {
    return users.filter(user => getUserStatus(user) === 'rejected');
  };

  if (loading) {
    return (
      <div className="text-center p-8">
        <div className="text-emerald-400 font-trading text-xl">
          LOADING USER DATA...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-black/90 border-2 border-emerald-500/50 shadow-2xl shadow-emerald-500/20">
        <CardContent className="p-6">
          <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-emerald-950/50 border-emerald-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-emerald-400 font-trading text-sm">
                  TOTAL USERS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-300 font-trading">
                  {users.length}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-950/50 border-blue-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-400 font-trading text-sm">
                  APPROVED
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-300 font-trading">
                  {getApprovedUsers().length}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-yellow-950/50 border-yellow-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-yellow-400 font-trading text-sm">
                  PENDING
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-300 font-trading">
                  {getPendingUsers().length}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-950/50 border-red-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-red-400 font-trading text-sm">
                  ADMINS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-300 font-trading">
                  {users.filter(isUserAdmin).length}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-950/50 border-purple-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-purple-400 font-trading text-sm">
                  SIGNALS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-300 font-trading">
                  {signals.length}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-6 flex gap-4">
            <Button
              onClick={() => setActiveTab('users')}
              className={`font-trading ${activeTab === 'users' 
                ? 'bg-emerald-600 hover:bg-emerald-500' 
                : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              USER MANAGEMENT
            </Button>
            <Button
              onClick={() => setActiveTab('signals')}
              className={`font-trading ${activeTab === 'signals' 
                ? 'bg-emerald-600 hover:bg-emerald-500' 
                : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              SIGNAL MONITORING
            </Button>
          </div>

          {activeTab === 'users' && (
            <div className="bg-black/70 border border-emerald-500/30 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-emerald-400 font-trading text-xl neon-text">
                  USER MANAGEMENT CONSOLE
                </h3>
                <Dialog open={createUserDialog} onOpenChange={setCreateUserDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-500 font-trading">
                      CREATE USER
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-black/90 border-emerald-500/50">
                    <DialogHeader>
                      <DialogTitle className="text-emerald-400 font-trading">
                        CREATE NEW USER
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        type="email"
                        placeholder="Email Address"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        className="bg-black/70 border-emerald-500/50 text-emerald-100"
                      />
                      <Input
                        type="password"
                        placeholder="Password"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        className="bg-black/70 border-emerald-500/50 text-emerald-100"
                      />
                      <Input
                        type="text"
                        placeholder="Full Name (Optional)"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        className="bg-black/70 border-emerald-500/50 text-emerald-100"
                      />
                      <Button
                        onClick={createUser}
                        disabled={actionLoading === 'create'}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 font-trading"
                      >
                        {actionLoading === 'create' ? 'CREATING...' : 'CREATE USER'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow className="border-emerald-500/30">
                    <TableHead className="text-emerald-300 font-trading">EMAIL</TableHead>
                    <TableHead className="text-emerald-300 font-trading">NAME</TableHead>
                    <TableHead className="text-emerald-300 font-trading">ROLE</TableHead>
                    <TableHead className="text-emerald-300 font-trading">STATUS</TableHead>
                    <TableHead className="text-emerald-300 font-trading">JOINED</TableHead>
                    <TableHead className="text-emerald-300 font-trading">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="border-emerald-500/20">
                    <TableCell className="text-emerald-100 font-trading">
                      {user.email}
                    </TableCell>
                    <TableCell className="text-emerald-100 font-trading">
                      {user.full_name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={isUserAdmin(user) ? "destructive" : "secondary"}
                        className={`font-trading ${
                          isUserAdmin(user) 
                            ? 'bg-red-900/50 text-red-300 border-red-500/50' 
                            : 'bg-blue-900/50 text-blue-300 border-blue-500/50'
                        }`}
                      >
                        {getUserRole(user).toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={`font-trading ${
                          getUserStatus(user) === 'approved' 
                            ? 'bg-emerald-900/50 text-emerald-300 border-emerald-500/50' 
                            : getUserStatus(user) === 'pending'
                            ? 'bg-yellow-900/50 text-yellow-300 border-yellow-500/50'
                            : 'bg-red-900/50 text-red-300 border-red-500/50'
                        }`}
                      >
                        {getUserStatus(user).toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-emerald-100 font-trading text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {getUserStatus(user) === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => approveUser(user.id)}
                              disabled={actionLoading === user.id}
                              className="bg-emerald-900/50 border-emerald-500/50 text-emerald-300 hover:bg-emerald-800/50 font-trading text-xs"
                            >
                              APPROVE
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejectUser(user.id)}
                              disabled={actionLoading === user.id}
                              className="bg-red-900/50 border-red-500/50 text-red-300 hover:bg-red-800/50 font-trading text-xs"
                            >
                              REJECT
                            </Button>
                          </>
                        )}
                        
                        {getUserStatus(user) === 'approved' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleUserAccess(user.id, isUserActive(user))}
                            disabled={actionLoading === user.id}
                            className={`font-trading text-xs ${
                              isUserActive(user)
                                ? 'bg-red-900/50 border-red-500/50 text-red-300 hover:bg-red-800/50'
                                : 'bg-emerald-900/50 border-emerald-500/50 text-emerald-300 hover:bg-emerald-800/50'
                            }`}
                          >
                            {isUserActive(user) ? 'REVOKE' : 'ACTIVATE'}
                          </Button>
                        )}
                        
                        {!isUserAdmin(user) ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => makeUserAdmin(user.id)}
                            disabled={actionLoading === user.id}
                            className="bg-blue-900/50 border-blue-500/50 text-blue-300 hover:bg-blue-800/50 font-trading text-xs"
                          >
                            PROMOTE
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeAdminRole(user.id)}
                            disabled={actionLoading === user.id}
                            className="bg-orange-900/50 border-orange-500/50 text-orange-300 hover:bg-orange-800/50 font-trading text-xs"
                          >
                            DEMOTE
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeUser(user.id)}
                          disabled={actionLoading === user.id}
                          className="bg-gray-900/50 border-gray-500/50 text-gray-300 hover:bg-gray-800/50 font-trading text-xs"
                        >
                          REMOVE
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
                </Table>
              </div>
            )}

            {activeTab === 'signals' && (
              <div className="bg-black/70 border border-emerald-500/30 rounded-lg p-4">
                <h3 className="text-emerald-400 font-trading text-xl mb-4 neon-text">
                  TRADING SIGNALS MONITORING
                </h3>
                
                <Table>
                  <TableHeader>
                    <TableRow className="border-emerald-500/30">
                      <TableHead className="text-emerald-300 font-trading">USER</TableHead>
                      <TableHead className="text-emerald-300 font-trading">SYMBOL</TableHead>
                      <TableHead className="text-emerald-300 font-trading">TYPE</TableHead>
                      <TableHead className="text-emerald-300 font-trading">ENTRY</TableHead>
                      <TableHead className="text-emerald-300 font-trading">CONFIDENCE</TableHead>
                      <TableHead className="text-emerald-300 font-trading">CREATED</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {signals.map((signal) => (
                      <TableRow key={signal.id} className="border-emerald-500/20">
                        <TableCell className="text-emerald-100 font-trading">
                          {signal.profiles?.full_name || signal.profiles?.email || 'Unknown'}
                        </TableCell>
                        <TableCell className="text-emerald-100 font-trading font-bold">
                          {signal.symbol}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={`font-trading ${
                              signal.signal_type === 'bullish' 
                                ? 'bg-emerald-900/50 text-emerald-300 border-emerald-500/50' 
                                : 'bg-red-900/50 text-red-300 border-red-500/50'
                            }`}
                          >
                            {signal.signal_type.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-emerald-100 font-trading">
                          ${signal.entry_price}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={`font-trading ${
                              signal.confidence_level === 'very_high' 
                                ? 'bg-emerald-900/50 text-emerald-300 border-emerald-500/50' 
                                : signal.confidence_level === 'high'
                                ? 'bg-blue-900/50 text-blue-300 border-blue-500/50'
                                : signal.confidence_level === 'medium'
                                ? 'bg-yellow-900/50 text-yellow-300 border-yellow-500/50'
                                : 'bg-gray-900/50 text-gray-300 border-gray-500/50'
                            }`}
                          >
                            {signal.confidence_level.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-emerald-100 font-trading text-sm">
                          {new Date(signal.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {signals.length === 0 && (
                  <div className="text-center py-8 text-emerald-300/70 font-trading">
                    NO TRADING SIGNALS FOUND
                  </div>
                )}
              </div>
            )}
      </Card>
    </div>
  );
};