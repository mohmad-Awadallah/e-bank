// app/(dashboard)/layout.tsx

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/common/LoadingScreen';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return <LoadingScreen />;
    }

    return (
        <div className="flex h-screen">
            <main className="flex-1 overflow-auto p-6 bg-gray-50">
                {children}
            </main>
        </div>
    );
}
