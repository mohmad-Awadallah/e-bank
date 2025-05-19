// app/admin/users/page.tsx

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ArrowRight, Search, Check, X, Trash, ChevronUp, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import LoadingScreen from '@/components/common/LoadingScreen';
import userService from '@/services/user';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  formattedCreatedAt: string;
  enabled: boolean;
  role: string;
}

type SortKey = keyof Omit<User, 'formattedCreatedAt'>;

export default function UsersPage() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await userService.getAllUsers();
        const usersData: User[] = (data as any[]).map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          createdAt: new Date(user.createdAt),
          formattedCreatedAt: new Date(user.createdAt).toLocaleDateString('en-GB', {
            year: 'numeric', month: 'short', day: 'numeric'
          }),
          enabled: user.enabled,
          role: user.role.replace('ROLE_', ''),
        }));
        setUsers(usersData);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const toggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      await userService.patchUserStatus(userId, { enabled: newStatus });
      setUsers(prev =>
        prev?.map(u => u.id === userId ? { ...u, enabled: newStatus } : u) || null
      );
      toast.success(`User ${newStatus ? 'enabled' : 'disabled'} successfully`);
    } catch (err) {
      console.error('Error updating user status:', err);
      toast.error('Failed to update user status');
    }
  };

  const confirmDeleteUser = async () => {
    if (selectedUserId == null) return;
    try {
      await userService.deleteUser(selectedUserId);
      setUsers(prev => prev?.filter(u => u.id !== selectedUserId) || null);
      toast.success('User deleted successfully');
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('Failed to delete user');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedUserId(null);
    }
  };

  const handleSort = (column: SortKey) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const filteredAndSorted = useMemo(() => {
    const filtered = users
      ? users.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
      : [];

    return filtered.sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';
      switch (sortBy) {
        case 'firstName':
          valA = `${a.firstName} ${a.lastName}`.toLowerCase();
          valB = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'username':
          valA = a.username.toLowerCase();
          valB = b.username.toLowerCase();
          break;
        case 'email':
          valA = a.email.toLowerCase();
          valB = b.email.toLowerCase();
          break;
        case 'createdAt':
          valA = a.createdAt.getTime();
          valB = b.createdAt.getTime();
          break;
        case 'enabled':
          valA = a.enabled ? 1 : 0;
          valB = b.enabled ? 1 : 0;
          break;
        case 'role':
          valA = a.role.toLowerCase();
          valB = b.role.toLowerCase();
          break;
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [users, searchQuery, sortBy, sortOrder]);

  if (loading) return <LoadingScreen />;
  if (error) return <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg">❌ Failed to load users.</div>;

  return (
    <div className="p-6 space-y-8">
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteUser}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Users List</h1>
          <p className="text-gray-600">Manage all the users in the system here.</p>
        </div>
        <Link href="/admin/dashboard" className="text-primary flex items-center gap-2 hover:underline">
          Back to Dashboard
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search users..."
          className="pl-10"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              {[
                { key: 'firstName', label: 'Name' },
                { key: 'username', label: 'Username' },
                { key: 'email', label: 'Email' },
                { key: 'createdAt', label: 'Join Date' },
                { key: 'enabled', label: 'Status' },
                { key: 'role', label: 'Role' },
              ].map(col => (
                <th
                  key={col.key}
                  className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(col.key as SortKey)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortBy === col.key && (
                      sortOrder === 'asc'
                        ? <ChevronUp className="h-4 w-4" />
                        : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </th>
              ))}
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredAndSorted.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{`${user.firstName} ${user.lastName}`}</td>
                <td className="px-4 py-2 text-gray-600">{user.username}</td>
                <td className="px-4 py-2 text-gray-600">{user.email}</td>
                <td className="px-4 py-2">{user.formattedCreatedAt}</td>
                <td className="px-4 py-2">
                  <Badge variant="outline" className={user.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {user.enabled ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-4 py-2 text-gray-600">{user.role}</td>
                <td className="px-4 py-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => toggleUserStatus(user.id, user.enabled)}
                  >
                    {user.enabled ? (
                      <>
                        <X className="h-4 w-4 text-red-600" />
                        <span>Disable</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Enable</span>
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => {
                      setSelectedUserId(user.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash className="h-4 w-4 text-gray-600" />
                    <span>Delete</span>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
