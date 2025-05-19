// app/(dashboard)/account/page.tsx

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import {
  getAccountDetails,
  getUserAccounts,
  deposit,
  withdraw,
} from '@/services/account';
import { Account } from '@/types/auth';
import LoadingScreen from '@/components/common/LoadingScreen';
import toast, { Toaster } from 'react-hot-toast';
import {
  FiRefreshCw,
  FiInfo,
  FiList,
  FiDollarSign,
  FiArrowDownCircle,
  FiArrowUpCircle,
  FiCreditCard,
} from 'react-icons/fi';

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="p-6 text-red-600 text-center">{message}</div>
);

const AccountInfo = ({ account }: { account: Account }) => (
  <div className="bg-white rounded-lg shadow p-6 mb-6">
    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
      <FiInfo /> Account Information
    </h2>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-gray-600">Account Number</p>
        <p className="font-medium">{account.accountNumber}</p>
      </div>
      <div>
        <p className="text-gray-600">Available Balance</p>
        <p className={`font-medium ${account.balance === 0 ? 'text-gray-500' : 'text-green-600'}`}>
          {account.balance === 0
            ? 'No available balance'
            : `${account.balance.toLocaleString()} ${account.currency}`}
        </p>
      </div>
      <div>
        <p className="text-gray-600">Account Type</p>
        <p className="font-medium capitalize">
          {account.accountType.toLowerCase()}
        </p>
      </div>
      <div>
        <p className="text-gray-600">Account Name</p>
        <p className="font-medium">{account.accountName}</p>
      </div>
      <div>
        <p className="text-gray-600">Status</p>
        <p className={`font-medium ${account.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
          {account.status}
        </p>
      </div>
    </div>
  </div>
);

const Transactions = ({
  transactions,
  currency,
}: {
  transactions: Account['transactions'];
  currency: string;
}) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6 text-center">
        <p className="text-gray-600">No transactions available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <FiList /> Recent Transactions
      </h2>
      <div className="space-y-4">
        {transactions.map((tx) => (
          <div key={tx.id} className="border-b pb-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{tx.description}</p>
                <p className="text-sm text-gray-500">
                  {new Date(tx.date).toLocaleString()}
                </p>
              </div>
              <p className={`font-medium ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                {tx.amount.toLocaleString()} {currency}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function AccountPage() {
  const { user, isAuthenticated } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [amount, setAmount] = useState<string>('0');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!user?.id) throw new Error('User not recognized');
      const userAccounts = await getUserAccounts(user.id);
      setAccounts(userAccounts);
      if (userAccounts.length) {
        const firstId = String(userAccounts[0].id);
        setSelectedId(firstId);
        setAccount(await getAccountDetails(firstId));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [user, isAuthenticated]);

  

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedId(id);
    setLoading(true);
    try {
      setAccount(await getAccountDetails(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const doAction = async (
    action: typeof deposit | typeof withdraw,
    successMsg: string
  ) => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Amount must be a valid number greater than zero');
      return;
    }
    if (!account) {
      toast.error('Account not found');
      return;
    }

    setSubmitting(true);
    try {
      await action(String(account.id), parsedAmount);
      toast.success(successMsg);
      fetchData();
      setAmount('0');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return <div className="p-6 text-center">Please log in first</div>;
  }
  if (loading) return <LoadingScreen />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      <main className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <FiCreditCard />
          <label htmlFor="accountSelect" className="font-medium">
            Select Account:
          </label>
          <select
            id="accountSelect"
            value={selectedId ?? ''}
            onChange={handleChange}
            className="border rounded p-2"
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.accountNumber}
              </option>
            ))}
          </select>
          <button
            onClick={fetchData}
            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
          >
            <FiRefreshCw className="mr-2" /> Refresh
          </button>
        </div>

        {account && (
          <>
            <AccountInfo account={account} />
            <Transactions
              transactions={account.transactions}
              currency={account.currency}
            />
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FiDollarSign /> Deposit or Withdraw Funds
              </h2>
              <div className="mb-4">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  placeholder="Enter amount"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => doAction(deposit, 'Deposit successful')}
                  disabled={submitting}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                >
                  <FiArrowDownCircle /> Deposit
                </button>
                <button
                  onClick={() => doAction(withdraw, 'Withdrawal successful')}
                  disabled={submitting}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
                >
                  <FiArrowUpCircle /> Withdraw
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
