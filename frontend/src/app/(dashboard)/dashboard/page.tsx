// app/(dashboard)/dashboard
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { RecentTransactions, Transaction as UiTransaction } from '@/components/dashboard/RecentTransactions';
import { AnalyticsSection } from '@/components/dashboard/AnalyticsSection';
import LoadingScreen from '@/components/common/LoadingScreen';
import { getUserAccounts } from '@/services/account';
import { Account } from '@/types/auth';
import { getRecentTransactions, ApiTransaction } from '@/services/dashboard';
import { format } from 'date-fns';

export default function DashboardHome() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<UiTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
    } else {
      loadAccounts();
    }
  }, [isAuthenticated, user]);

  const loadAccounts = async () => {
    try {
      const userAccounts = await getUserAccounts(user!.id);
      if (userAccounts.length === 0) throw new Error('No accounts found for user');
      setAccounts(userAccounts);
      // Default to first account
      setSelectedAccount(userAccounts[0].accountNumber);
    } catch (error) {
      console.error('Error fetching user accounts:', error);
    }
  };

  const loadTransactions = useCallback(
    async (accountNumber: string) => {
      setLoading(true);
      try {
        const apiTxns: ApiTransaction[] = await getRecentTransactions(accountNumber);
        const mapped: UiTransaction[] = apiTxns.map(tx => {
          const isCredit = tx.targetAccountNumber === accountNumber;
          return {
            id: tx.id,
            title: tx.description,
            displayAmount: `${isCredit ? '+' : '-'}${tx.currency} ${tx.amount.toFixed(2)}`,
            formattedDate: format(new Date(tx.date), 'MMM d, yyyy h:mm a'),
            category: tx.type.charAt(0).toUpperCase() + tx.type.slice(1),
            isCredit
          };
        });
        setTransactions(mapped);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    }, []);

  // Fetch transactions when selectedAccount changes
  useEffect(() => {
    if (selectedAccount) {
      loadTransactions(selectedAccount);
    }
  }, [selectedAccount, loadTransactions]);

  if (!isAuthenticated || loading) return <LoadingScreen />;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Welcome back, {user?.firstName}!</h1>
      </header>

      {/* Account selector */}
      {accounts.length > 1 && (
        <div>
          <label htmlFor="account-select" className="mr-2 font-medium">Select Account:</label>
          <select
            id="account-select"
            className="border rounded p-1"
            value={selectedAccount || undefined}
            onChange={e => setSelectedAccount(e.target.value)}
          >
            {accounts.map(acc => (
              <option key={acc.accountNumber} value={acc.accountNumber}>
                {acc.accountNumber}
              </option>
            ))}
          </select>
        </div>
      )}

      <RecentTransactions transactions={transactions} />
      <AnalyticsSection />
    </main>
  );
}