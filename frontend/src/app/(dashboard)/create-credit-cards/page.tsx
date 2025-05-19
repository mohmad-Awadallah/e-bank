// src/app/(dashboard)/create-credit-cards/page.tsx

"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/contexts/AuthContext';
import { getUserAccounts } from '@/services/account';
import { issueCreditCard, CardType } from '@/services/credit-cards';
import { FaCreditCard, FaUser, FaUniversity, FaDollarSign, FaCcVisa } from "react-icons/fa";
import toast from 'react-hot-toast';

export default function CreateCreditCardPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [accounts, setAccounts] = useState<{ id: string; accountNumber: string }[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<string>("");
    const [cardHolder, setCardHolder] = useState("");
    const [cardType, setCardType] = useState<CardType>(CardType.VISA);
    const [creditLimit, setCreditLimit] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadAccounts = async () => {
            if (!user?.id) return;
            try {
                const accs = await getUserAccounts(user.id);
                const formatted = accs.map(acc => ({ id: acc.id.toString(), accountNumber: acc.accountNumber }));
                setAccounts(formatted);
                if (formatted.length > 0) setSelectedAccount(formatted[0].id);
            } catch (err) {
                console.error(err);
                toast.error('Failed to load accounts');
            }
        };
        loadAccounts();
    }, [user]);

    useEffect(() => {
        if (user?.firstName && user?.lastName) {
            setCardHolder(`${user.firstName} ${user.lastName}`);
        }
    }, [user]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedAccount) return toast.error('Please select an account');
        setLoading(true);
        try {
            await issueCreditCard({
                accountId: Number(selectedAccount),
                cardHolderName: cardHolder,
                cardType,
                creditLimit: parseFloat(creditLimit),
            });
            toast.success('Account created successfully');
            router.push('/credit-cards?success=true');
        } catch (err) {
            console.error(err);
            toast.error('Failed to issue credit card');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-6 bg-white shadow rounded mt-8">
            <h1 className="text-2xl font-bold flex items-center mb-6">
                <FaCreditCard className="mr-2 text-blue-600" /> Issue Credit Card
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Account selection */}
                <div>
                    <label className="block font-medium mb-1">Select Account</label>
                    <div className="flex items-center border rounded px-3 py-2">
                        <FaUniversity className="mr-2 text-gray-500" />
                        <select
                            className="flex-1 outline-none"
                            value={selectedAccount}
                            onChange={e => setSelectedAccount(e.target.value)}
                            required
                        >
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.accountNumber}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Card Holder Name */}
                <div>
                    <label className="block font-medium mb-1">Card Holder Name</label>
                    <div className="flex items-center border rounded px-3 py-2 bg-gray-100 cursor-not-allowed">
                        <FaUser className="mr-2 text-gray-500" />
                        <input
                            type="text"
                            className="flex-1 bg-transparent outline-none"
                            value={cardHolder}
                            readOnly
                            required
                        />
                    </div>
                </div>

                {/* Card Type */}
                <div>
                    <label className="block font-medium mb-1">Card Type</label>
                    <div className="flex items-center border rounded px-3 py-2">
                        <FaCcVisa className="mr-2 text-gray-500" />
                        <select
                            className="flex-1 outline-none"
                            value={cardType}
                            onChange={e => setCardType(e.target.value as CardType)}
                            required
                        >
                            <option value={CardType.VISA}>Visa</option>
                            <option value={CardType.MASTERCARD}>MasterCard</option>
                            <option value={CardType.AMERICAN_EXPRESS}>American Express</option>
                            <option value={CardType.DISCOVER}>Discover</option>
                        </select>
                    </div>
                </div>

                {/* Credit Limit */}
                <div>
                    <label className="block font-medium mb-1">Credit Limit ($)</label>
                    <div className="flex items-center border rounded px-3 py-2">
                        <FaDollarSign className="mr-2 text-gray-500" />
                        <input
                            type="number"
                            className="flex-1 outline-none"
                            value={creditLimit}
                            onChange={e => setCreditLimit(e.target.value)}
                            required
                            min="0"
                            step="0.01"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 rounded text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {loading ? 'Issuing...' : 'Issue Card'}
                </button>
            </form>
        </div>
    );
}
