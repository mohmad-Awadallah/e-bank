// src/app/bill-payment/history/page.tsx

"use client";

import { useState, useEffect } from "react";
import { getPaymentHistory, BillPayment } from "@/services/bill-payment";
import { getUserAccounts } from "@/services/account";
import LoadingScreen from '@/components/common/LoadingScreen';
import { FaReceipt, FaCheckCircle, FaExclamationCircle, FaRegFolderOpen } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { IconContext } from "react-icons";

export default function BillPaymentHistoryPage() {
    const { user } = useAuth();
    const [accounts, setAccounts] = useState<{ id: string; accountNumber: string }[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
    const [paymentHistory, setPaymentHistory] = useState<BillPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const accountId = selectedAccount || user?.id;

    // Fetch user accounts on mount
    useEffect(() => {
        const fetchAccounts = async () => {
            if (!user?.id) return;
            try {
                const accs = await getUserAccounts(user.id);
                setAccounts(accs.map(acc => ({ ...acc, id: acc.id.toString() })));
                if (accs.length > 0) setSelectedAccount(accs[0].id.toString());
            } catch (err) {
                console.error(err);
                setError('Failed to load accounts.');
            }
        };
        fetchAccounts();
    }, [user]);

    // Fetch payment history when accountId changes
    useEffect(() => {
        const fetchPaymentHistory = async () => {
            if (!accountId) {
                setError('No account selected.');
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const data = await getPaymentHistory(accountId);
                setPaymentHistory(data);
                setError(null);
            } catch (err) {
                console.error(err);
                setError("An error occurred while fetching payment history.");
            } finally {
                setLoading(false);
            }
        };
        fetchPaymentHistory();
    }, [accountId]);

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <IconContext.Provider value={{ size: "1.2em" }}>
            <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow mt-8">
                <h1 className="text-2xl font-bold mb-4 flex items-center">
                    <FaReceipt className="mr-2 text-blue-600" /> Payment History
                </h1>

                {error && (
                    <div className="flex items-center text-red-600 bg-red-100 p-3 rounded mb-4">
                        <FaExclamationCircle className="mr-2" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Accounts dropdown */}
                {accounts.length > 1 && (
                    <div className="mb-4">
                        <label htmlFor="accountSelect" className="block mb-1 font-medium">Select Account:</label>
                        <select
                            id="accountSelect"
                            className="border px-3 py-2 rounded w-full"
                            value={selectedAccount || ''}
                            onChange={e => setSelectedAccount(e.target.value)}
                        >
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>
                                    {acc.accountNumber}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {!error && paymentHistory.length === 0 && (
                    <div className="flex items-center text-gray-600 mt-4">
                        <FaRegFolderOpen className="mr-2 text-xl" />
                        <span>No payment history found for this account.</span>
                    </div>
                )}

                {!error && paymentHistory.length > 0 && (
                    <table className="min-w-full table-auto border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="py-2 px-4 border">Receipt</th>
                                <th className="py-2 px-4 border">Biller Code</th>
                                <th className="py-2 px-4 border">Amount</th>
                                <th className="py-2 px-4 border">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentHistory.map((payment) => (
                                <tr key={payment.id}>
                                    <td className="py-2 px-4 border flex items-center gap-2">
                                        <FaCheckCircle className="text-green-500" />
                                        {payment.receiptNumber}
                                    </td>
                                    <td className="py-2 px-4 border">{payment.billerCode}</td>
                                    <td className="py-2 px-4 border">${payment.amount.toFixed(2)}</td>
                                    <td className="py-2 px-4 border">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </IconContext.Provider>
    );
}
