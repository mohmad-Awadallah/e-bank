// app/admin/accounts/page.tsx


'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight, Search } from 'lucide-react'; // Ensure these are imported as components
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Badge } from '@/components/ui/badge';
import { InputWithIcon } from '@/components/ui/InputWithIcon';
import { Button } from '@/components/ui/button';
import LoadingScreen from '@/components/common/LoadingScreen';
import userService from '@/services/user';

interface User {
    id: string;
    username: string;
    email: string;
    role: string;
    status: 'active' | 'inactive';
    createdAt: string;
}

export default function AccountsPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Debouncing the search input to optimize filtering
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm.trim() === '') {
                setFilteredUsers(users);
            } else {
                const filtered = users.filter(user =>
                    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.role.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setFilteredUsers(filtered);
            }
        }, 500); // Delay filtering for 500ms

        return () => clearTimeout(timer); // Clean up on component unmount or search change
    }, [searchTerm, users]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const data = await userService.getAllUsers();
                setUsers(data);
                setFilteredUsers(data);
            } catch (error) {
                setError('Failed to fetch users');
                toast.error('Error fetching users');
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col space-y-8">
                <div className="flex flex-col space-y-4">
                    <h1 className="text-3xl font-bold">User Accounts</h1>
                    <p className="text-gray-600">
                        Manage all user accounts and their permissions
                    </p>
                </div>

                <div className="flex flex-col space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="w-full md:w-1/3">
                            <InputWithIcon
                                icon={<Search />} // Ensure the icon is passed as a React component
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {filteredUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <p className="text-gray-500 text-lg">
                                {searchTerm ? 'No users match your search' : 'No users found'}
                            </p>
                        </div>
                    ) : (
                        <div className="border rounded-lg overflow-hidden">
                            <div className="grid grid-cols-12 bg-gray-100 p-4 font-medium">
                                <div className="col-span-4 md:col-span-3">Username</div>
                                <div className="col-span-4 md:col-span-3">Email</div>
                                <div className="col-span-2 md:col-span-2">Role</div>
                            </div>

                            {filteredUsers.map((user) => (
                                <div key={user.id} className="grid grid-cols-12 p-4 items-center border-t">
                                    <div className="col-span-4 md:col-span-3 font-medium">{user.username}</div>
                                    <div className="col-span-4 md:col-span-3 text-gray-600">{user.email}</div>
                                    <div className="col-span-2 md:col-span-2">
                                        <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                                            {user.role}
                                        </Badge>

                                    </div>
                                    <div className="col-span-2 md:col-span-2 flex justify-end">
                                        <Link href={`/admin/accounts/${user.id}`}>
                                            <Button variant="outline" size="sm">
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
