// src/components/dashboard/RecentTransactions.tsx
import Link from 'next/link';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
  CreditCard,
  Wallet,
  Activity
} from 'lucide-react';

export type Transaction = {
  id: number;
  title: string;
  displayAmount: string;
  formattedDate: string;
  category: string;
};

type Props = {
  transactions: Transaction[];
};

// اختيار أيقونة حسب نوع المعاملة
const getIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'transfer':
      return <Banknote className="w-5 h-5 text-gray-500" />;
    case 'payment':
      return <CreditCard className="w-5 h-5 text-gray-500" />;
    case 'deposit':
      return <Wallet className="w-5 h-5 text-gray-500" />;
    default:
      return <Activity className="w-5 h-5 text-gray-500" />;
  }
};

// تحديد ما إذا كانت العملية Credit أم لا
const isCreditTransaction = (category: string): boolean => {
  const creditTypes = ['deposit', 'reversal', 'refund'];
  return creditTypes.includes(category.toLowerCase());
};

export function RecentTransactions({ transactions }: Props) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" />
          Recent Transactions
        </h2>
        <Link href="/transactions" className="text-blue-600 hover:underline">
          View All
        </Link>
      </div>

      <div className="space-y-4">
        {transactions.map(tx => {
          const isCredit = isCreditTransaction(tx.category);

          return (
            <div key={tx.id} className="flex justify-between items-center border-b last:border-0 pb-3">
              <div className="flex items-center gap-3">
                {getIcon(tx.category)}
                <div>
                  <p className="font-medium">{tx.title}</p>
                  <p className="text-sm text-gray-500">
                    {tx.formattedDate} • {tx.category}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isCredit ? (
                  <ArrowDownCircle className="text-green-500 w-5 h-5" />
                ) : (
                  <ArrowUpCircle className="text-red-500 w-5 h-5" />
                )}
                <p className={`font-semibold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.displayAmount}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
