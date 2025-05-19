// app/dashboard/transactions/page.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { getUserTransactions } from '@/services/transaction';
import { Transaction, TransactionType } from '@/types/auth';
import { FiSearch, FiFilter } from 'react-icons/fi';
import TransactionRow from '@/components/Transactions/TransactionRow';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
  </div>
);

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="p-6 text-red-600 text-center">{message}</div>
);

export default function TransactionsPage() {
  const { user, isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<
    'ALL' | TransactionType
  >('ALL');

  const fetchTransactions = useCallback(async () => {
    try {
      if (!user?.id) throw new Error('User not recognized');
      const txs = (await getUserTransactions(Number(user.id))) as Transaction[];

      // نوحد type إلى UPPERCASE ونتأكد أنه مطابق للـ TransactionType
      const normalized: Transaction[] = txs.map(tx => ({
        ...tx,
        type: tx.type.toUpperCase() as TransactionType,
      }));

      // ترتيب تنازلي بحسب التاريخ
      normalized.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setTransactions(normalized);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) fetchTransactions();
  }, [isAuthenticated, fetchTransactions]);

  if (!isAuthenticated)
    return <div className="p-6 text-center">Please log in first</div>;
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  // تطبيق البحث والفلترة
  const filteredTransactions = transactions.filter(tx => {
    const matchesReference = tx.reference
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || tx.type === typeFilter;
    return matchesReference && matchesType;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">All Transactions</h1>

      {/* شريط البحث والتصفية */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center w-full md:w-1/2 relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by reference..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center w-full md:w-1/3 relative">
          <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            value={typeFilter}
            onChange={e =>
              setTypeFilter(e.target.value as 'ALL' | TransactionType)
            }
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All</option>
            <option value="TRANSFER">Transfer</option>
            <option value="DEPOSIT">Deposit</option>
            <option value="WITHDRAWAL">Withdrawal</option>
            <option value="PAYMENT">Payment</option>
            <option value="REVERSAL">Reversal</option>
          </select>
        </div>
      </div>

      {/* عرض المعاملات */}
      {filteredTransactions.length === 0 ? (
        <div className="text-gray-600 text-center">No transactions found</div>
      ) : (
        <div className="bg-white shadow rounded-lg divide-y">
          {filteredTransactions.map(tx => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
        </div>
      )}
    </div>
  );
}
