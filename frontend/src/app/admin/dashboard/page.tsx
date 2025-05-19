// app/admin/dashboard/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { Users, Activity, FileWarning, ArrowRight } from 'lucide-react';
import { updateUserRole, fetchAdminStats, fetchRecentUsers } from '@/services/admin';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Link from 'next/link';
import LoadingScreen from '@/components/common/LoadingScreen';
import { toast } from 'react-hot-toast';

interface Stat {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'neutral';
  change: string;
}

interface RecentUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  enabled: boolean;
  role: string;
}

interface RoleDistribution {
  name: string;
  value: number;
  color: string;
}

interface SummaryStat {
  title: string;
  value: number;
  color: string;
}

enum Trend {
  Up = 'up',
  Down = 'down',
  Neutral = 'neutral',
}

function formatUser(user: any): RecentUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    createdAt: new Date(user.createdAt).toLocaleDateString(),
    enabled: user.enabled,
    role: user.role.replace('ROLE_', ''),
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stat[] | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[] | null>(null);
  const [roleData, setRoleData] = useState<RoleDistribution[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [s, u] = await Promise.all([
          fetchAdminStats(),
          fetchRecentUsers(),
        ]);

        const formattedStats: Stat[] = [
          { title: 'Total Users', value: s.totalUsers, icon: <Users className="w-6 h-6" />, trend: Trend.Up, change: '+12%' },
          { title: 'Active Users', value: s.activeUsers, icon: <Activity className="w-6 h-6" />, trend: Trend.Neutral, change: '0%' },
          { title: 'Inactive Users', value: s.inactiveUsers, icon: <FileWarning className="w-6 h-6" />, trend: Trend.Down, change: '-5%' },
        ];

        const formattedUsers = u.map(formatUser);

        const roleCounts = u.reduce((acc: Record<string, number>, user: any) => {
          const role = user.role.replace('ROLE_', '');
          acc[role] = (acc[role] || 0) + 1;
          return acc;
        }, {});

        const formattedRoles: RoleDistribution[] = Object.entries(roleCounts).map(
          ([role, count], idx) => ({
            name: role,
            value: count as number,
            color: ['#8884d8', '#82ca9d', '#ffc658'][idx % 3],
          })
        );

        const formattedSummary: SummaryStat[] = [
          { title: "Today's Logins", value: s.todaysLogins, color: 'green' },
          { title: "Today's Transactions", value: s.todaysTransactions, color: 'purple' },
          { title: 'New Users Today', value: s.todaysNewUsers, color: 'blue' },
          { title: 'Pending Actions', value: s.totalAccounts, color: 'orange' },
          { title: 'Active Coupons', value: s.activeCoupons, color: 'pink' },
          { title: 'Total Credit Cards', value: s.totalCreditCards, color: 'teal' },
          { title: 'Total Wallets', value: s.totalWallets, color: 'Brown' },
          { title: 'Total Wire Transfers', value: s.totalWireTransfers, color: 'indigo' },
          { title: "Today's Notifications", value: s.todaysNotifications, color: 'red' },
        ];

        setStats(formattedStats);
        setRecentUsers(formattedUsers);
        setRoleData(formattedRoles);
        setSummaryData(formattedSummary);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please check your connection or try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredUsers = selectedRole
    ? recentUsers?.filter((u) => u.role.toLowerCase() === selectedRole.toLowerCase())
    : recentUsers;

  const updateUserRoleHandler = async (userId: number, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      const usersRes = await fetchRecentUsers();
      const updatedUsers = usersRes.map(formatUser);
      setRecentUsers(updatedUsers);
      toast.success('User role updated successfully');
    } catch (err) {
      toast.error('Failed to update user role');
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="mb-4">Welcome, manage users and view system metrics here.</p>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg">
          ❌ {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryData.map((item) => (
          <div key={item.title} className={`p-4 rounded-lg shadow-md text-white`} style={{ backgroundColor: item.color }}>
            <div className="text-sm">{item.title}</div>
            <div className="text-2xl font-bold">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Role Distribution -- ضع هنا المخطط إذا كنت تستخدم Chart.js أو Recharts */}
      {/* Role Distribution Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">User Role Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={roleData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent }) =>
                `${name} (${(percent * 100).toFixed(0)}%)`
              }
            >
              {roleData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>


      {/* Recent Users */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Recently Registered Users</h2>
            <div>
              <label className="mr-2 text-sm text-gray-700">Filter by Role:</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="border px-2 py-1 rounded text-sm"
              >
                <option value="">All</option>
                {roleData.map((r) => (
                  <option key={r.name} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>
          <Link href="/admin/users" className="text-primary flex items-center gap-2 hover:underline">
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-left">Name</th>
                <th className="px-4 py-3 font-medium text-left">Email</th>
                <th className="px-4 py-3 font-medium text-left">Join Date</th>
                <th className="px-4 py-3 font-medium text-left">Status</th>
                <th className="px-4 py-3 font-medium text-left">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers?.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{`${user.firstName} ${user.lastName}`}</td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3">{user.createdAt}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-sm ${user.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRoleHandler(user.id, e.target.value)}
                      className="p-1 border rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="USER">USER</option>
                      <option value="AUDITOR">AUDITOR</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
