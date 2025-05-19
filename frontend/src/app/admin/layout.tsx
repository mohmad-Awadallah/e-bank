// app/admin/layout.tsx

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/common/LoadingScreen';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.replace('/login');
            } else if (!user.role?.includes('ROLE_ADMIN')) {
                router.replace('/admin/dashboard');
            }
        }1
    }, [user, loading, router]);

    if (loading) {
        return <LoadingScreen />;
    }
    

    return (
        <div className="flex h-screen">
            <main className="flex-1 overflow-auto p-6 bg-gray-100">
                {children}
            </main>
        </div>
    );
}
