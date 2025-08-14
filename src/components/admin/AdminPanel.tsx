import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface UserData {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  user_roles?: {
    role: string;
  }[];
}

export const AdminPanel = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string>('');

  useEffect(() => {
    fetchUsers();
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

  const getUserRole = (user: UserData) => {
    return user.user_roles?.[0]?.role || 'none';
  };

  const isUserActive = (user: UserData) => {
    return user.user_roles?.some(role => role.role === 'user') || false;
  };

  const isUserAdmin = (user: UserData) => {
    return user.user_roles?.some(role => role.role === 'admin') || false;
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
      <Card className="bg-black/90 border-2 border-red-500/50 shadow-2xl shadow-red-500/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-red-400 font-trading neon-text">
            🛡️ ADMIN CONTROL PANEL
          </CardTitle>
          <p className="text-red-300/70 font-trading">
            SYSTEM ADMINISTRATOR ACCESS - USER MANAGEMENT
          </p>
        </CardHeader>

        <CardContent>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-emerald-950/50 border-emerald-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-emerald-400 font-trading text-lg">
                  TOTAL USERS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-300 font-trading">
                  {users.length}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-950/50 border-blue-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-400 font-trading text-lg">
                  ACTIVE USERS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-300 font-trading">
                  {users.filter(isUserActive).length}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-950/50 border-red-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-red-400 font-trading text-lg">
                  ADMINS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-300 font-trading">
                  {users.filter(isUserAdmin).length}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-black/70 border border-emerald-500/30 rounded-lg p-4">
            <h3 className="text-emerald-400 font-trading text-xl mb-4 neon-text">
              USER MANAGEMENT CONSOLE
            </h3>
            
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
                        variant={isUserActive(user) ? "default" : "outline"}
                        className={`font-trading ${
                          isUserActive(user) 
                            ? 'bg-emerald-900/50 text-emerald-300 border-emerald-500/50' 
                            : 'bg-gray-900/50 text-gray-300 border-gray-500/50'
                        }`}
                      >
                        {isUserActive(user) ? 'ACTIVE' : 'INACTIVE'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-emerald-100 font-trading text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
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
                          {isUserActive(user) ? 'REVOKE' : 'APPROVE'}
                        </Button>
                        
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};