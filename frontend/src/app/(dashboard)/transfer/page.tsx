
// app/(dashboard)/transfer/page.tsx

'use client';

import { useState, useEffect, FormEvent } from 'react';
import { makeTransfer } from '@/services/transaction';
import { getUserAccounts } from '@/services/account';
import { useRouter } from 'next/navigation';
import {
    FiSend,
    FiDollarSign,
    FiRepeat,
    FiCreditCard,
    FiEdit3
} from 'react-icons/fi';
import {
    FaExclamationCircle,
    FaQuestionCircle,
    FaCheckCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Account, TransactionType } from '@/types/auth';
import { IconContext } from 'react-icons';

const transactionTypes: TransactionType[] = [
    'TRANSFER',
    'DEPOSIT',
    'WITHDRAWAL',
    'PAYMENT',
    'REVERSAL',
];

export default function TransferPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [type, setType] = useState<TransactionType>('TRANSFER');
    const [sourceAccountNumber, setSourceAccountNumber] = useState('');
    const [targetAccountNumber, setTargetAccountNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [reference, setReference] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (!isAuthenticated || !user?.id) return;
        getUserAccounts(user.id)
            .then(accs => {
                setAccounts(accs);
                if (accs.length) setSourceAccountNumber(accs[0].accountNumber);
            })
            .catch(console.error);
    }, [user, isAuthenticated]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!sourceAccountNumber || !targetAccountNumber || !amount || !reference) {
            setError('All fields are required');
            toast.error('All fields are required', { icon: <FaExclamationCircle /> });
            return;
        }
        const numeric = parseFloat(amount);
        if (isNaN(numeric) || numeric <= 0) {
            setError('Amount must be a number > 0');
            toast.error('Amount must be a number > 0', { icon: <FaExclamationCircle /> });
            return;
        }
        setError(null);
        setShowConfirmation(true);
    };

    const confirmTransfer = async () => {
        setShowConfirmation(false);
        setLoading(true);
        try {
            await makeTransfer({
                sourceAccountNumber,
                targetAccountNumber,
                amount: parseFloat(amount),
                reference,
                type,
            });
            setIsSuccess(true);
            toast.success('Transfer successful!', { icon: <FiSend /> });
            // redirect after showing success
            setTimeout(() => router.push('/transactions'), 2000);
        } catch {
            setError('Transfer failed. Please try again.');
            toast.error('Transfer failed. Please try again.', { icon: <FaExclamationCircle /> });
        } finally {
            setLoading(false);
        }
    };

    const selectedAccount = accounts.find(a => a.accountNumber === sourceAccountNumber);

    if (!isAuthenticated) {
        return <div className="p-6 text-center">Please log in first</div>;
    }

    return (
        <IconContext.Provider value={{ size: '1.1em' }}>
            <div className="min-h-screen bg-gray-50 p-6">
                <h1 className="text-2xl font-bold mb-6 flex items-center">
                    <FiSend className="mr-2 text-blue-600" />
                    Transfer Funds
                </h1>

                <div className="max-w-md mx-auto bg-white p-6 shadow-lg rounded-lg">
                    {isSuccess ? (
                        <div className="text-center py-10">
                            <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-2">Transfer Successful!</h2>
                            <p className="text-gray-600 mb-4">Your transfer of ${parseFloat(amount).toFixed(2)} was completed.</p>
                            <p className="text-gray-500">Redirecting to transactions...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {/* Transaction Type */}
                            <div className="mb-4">
                                <label htmlFor="type" className="flex items-center text-sm font-medium text-gray-700">
                                    <FiRepeat className="mr-2" />
                                    Transaction Type
                                </label>
                                <select
                                    id="type"
                                    value={type}
                                    onChange={e => setType(e.target.value as TransactionType)}
                                    className="w-full mt-1 p-2 border border-gray-300 rounded"
                                >
                                    {transactionTypes.map(t => (
                                        <option key={t} value={t}>
                                            {t.charAt(0) + t.slice(1).toLowerCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Source Account */}
                            <div className="mb-4">
                                <label htmlFor="sourceAccountNumber" className="flex items-center text-sm font-medium text-gray-700">
                                    <FiCreditCard className="mr-2" /> Source Account
                                </label>
                                <select
                                    id="sourceAccountNumber"
                                    value={sourceAccountNumber}
                                    onChange={e => setSourceAccountNumber(e.target.value)}
                                    className="w-full mt-1 p-2 border border-gray-300 rounded"
                                >
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.accountNumber}>
                                            {acc.accountNumber} – ${acc.balance.toFixed(2)}
                                        </option>
                                    ))}
                                </select>
                                {selectedAccount && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        Available Balance: <span className="font-medium">${selectedAccount.balance.toFixed(2)}</span>
                                    </p>
                                )}
                            </div>

                            {/* Target Account */}
                            <div className="mb-4">
                                <label htmlFor="targetAccountNumber" className="flex items-center text-sm font-medium text-gray-700">
                                    <FiCreditCard className="mr-2" /> Target Account
                                </label>
                                <input
                                    id="targetAccountNumber"
                                    type="text"
                                    value={targetAccountNumber}
                                    onChange={e => setTargetAccountNumber(e.target.value)}
                                    placeholder="Enter target account number"
                                    className="w-full mt-1 p-2 border border-gray-300 rounded"
                                />
                            </div>

                            {/* Amount */}
                            <div className="mb-4">
                                <label htmlFor="amount" className="flex items-center text-sm font-medium text-gray-700">
                                    <FiDollarSign className="mr-2" /> Amount
                                </label>
                                <div className="relative">
                                    <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        id="amount"
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded"
                                    />
                                </div>
                            </div>

                            {/* Reference */}
                            <div className="mb-4">
                                <label htmlFor="reference" className="flex items-center text-sm font-medium text-gray-700">
                                    <FiEdit3 className="mr-2" /> Reference
                                </label>
                                <input
                                    id="reference"
                                    type="text"
                                    value={reference}
                                    onChange={e => setReference(e.target.value)}
                                    placeholder="Enter reference"
                                    className="w-full mt-1 p-2 border border-gray-300 rounded"
                                />
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="flex items-center text-red-600 mb-4 gap-2">
                                    <FaExclamationCircle />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-2 px-4 bg-blue-500 text-white rounded-lg flex justify-center items-center ${
                                    loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                                }`}
                            >
                                {loading ? 'Processing...' : <><FiSend className="mr-2" />Transfer</>}
                            </button>
                        </form>
                    )}

                    {/* Confirmation Popup */}
                    {!isSuccess && showConfirmation && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
                                <FaQuestionCircle className="text-yellow-500 text-4xl mx-auto mb-4" />
                                <h2 className="text-lg font-semibold mb-2">Confirm Transfer</h2>
                                <p className="mb-4">
                                    Transfer <span className="font-bold">${parseFloat(amount).toFixed(2)}</span> to{' '}
                                    <span className="font-bold">{targetAccountNumber}</span>?
                                </p>
                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={confirmTransfer}
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        Yes, Confirm
                                    </button>
                                    <button
                                        onClick={() => setShowConfirmation(false)}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </IconContext.Provider>
    );
}