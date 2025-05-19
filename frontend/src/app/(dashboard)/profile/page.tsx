'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaUser, FaEnvelope, FaCog, FaUserTag, FaPhone } from 'react-icons/fa';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setError('User not authenticated');
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600 text-center">{error}</div>;
  }

  if (!isAuthenticated) {
    return <div className="p-6 text-center">Please log in first</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="flex items-center gap-2">
              <FaUser className="text-blue-600" />
              <div>
                <p className="text-gray-600">Full Name</p>
                <p className="font-medium">{user?.firstName} {user?.lastName}</p>
              </div>
            </div>

            {/* Username */}
            <div className="flex items-center gap-2">
              <FaUserTag className="text-blue-600" />
              <div>
                <p className="text-gray-600">Username</p>
                <p className="font-medium">{user?.username}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-2">
              <FaEnvelope className="text-blue-600" />
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex items-center gap-2">
              <FaPhone className="text-blue-600" />
              <div>
                <p className="text-gray-600">Phone Number</p>
                <p className="font-medium">{user?.phoneNumber || 'Not Provided'}</p>
              </div>
            </div>
          </div>

          {/* Settings Link */}
          <div className="mt-6 flex items-center gap-2">
            <FaCog className="text-blue-600" />
            <Link
              href="/profile/settings"
              className="text-blue-600 hover:underline font-medium"
            >
              Go to Settings
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}


