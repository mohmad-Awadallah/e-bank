// components/Transactions/TransactionRow.tsx
import { Transaction } from '@/types/auth';
import { FiSend, FiDownload, FiUpload, FiRepeat, FiCreditCard } from 'react-icons/fi';
import { MdOutlinePayments } from 'react-icons/md';

type TransactionRowProps = {
  tx: Transaction;
};

// دالة لإرجاع الأيقونة بناءً على النوع الموحد (UPPERCASE)
const getIconByType = (type: string) => {
  switch (type) {
    case 'TRANSFER':
      return <FiSend className="text-blue-500 w-5 h-5" />;
    case 'DEPOSIT':
      return <FiDownload className="text-green-500 w-5 h-5" />;
    case 'WITHDRAWAL':
      return <FiUpload className="text-red-500 w-5 h-5" />;
    case 'PAYMENT':
      return <MdOutlinePayments className="text-yellow-500 w-5 h-5" />;
    case 'REVERSAL':
      return <FiRepeat className="text-purple-500 w-5 h-5" />;
    default:
      return <FiCreditCard className="text-gray-400 w-5 h-5" />;
  }
};

const TransactionRow = ({ tx }: TransactionRowProps) => {
  // نوع المعاملة موحد إلى UPPERCASE
  const type = tx.type.toUpperCase();
  // تلوين المبلغ بناءً على إشارته
  const amountClass = tx.amount < 0 ? 'text-red-500' : 'text-green-600';

  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
      <div className="flex items-center gap-3">
        {getIconByType(type)}
        <div>
          <div className="font-medium text-gray-800">{tx.reference}</div>
          <div className="text-sm text-gray-500">
            {new Date(tx.date).toLocaleString()}
          </div>
        </div>
      </div>
      <div className={`text-sm font-semibold ${amountClass}`}>
        {Math.abs(tx.amount).toLocaleString()} {tx.currency}
      </div>
    </div>
  );
};

export default TransactionRow;
