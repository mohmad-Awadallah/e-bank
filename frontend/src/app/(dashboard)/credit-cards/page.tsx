// src/app/(dashboard)/credit-cards/page.tsx

"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserAccounts, Account } from '@/services/account';
import LoadingScreen from '@/components/common/LoadingScreen';
import { getAccountCards, CreditCardResponseDTO } from '@/services/credit-cards';
import {
    FaCreditCard,
    FaCcVisa,
    FaCcMastercard,
    FaCcAmex,
    FaCcDiscover,
} from 'react-icons/fa';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CreditCardsPage() {
    const { user } = useAuth();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccountId, setSelectedAccountId] = useState<number | ''>('');
    const [cards, setCards] = useState<CreditCardResponseDTO[]>([]);
    const [loadingAccounts, setLoadingAccounts] = useState(true);
    const [loadingCards, setLoadingCards] = useState(false);

    // Load accounts on mount
    useEffect(() => {
        const loadAccounts = async () => {
            if (!user?.id) return;
            try {
                const accs = await getUserAccounts(user.id);
                setAccounts(accs);
                // Select the first account by default if available
                if (accs.length > 0) {
                    setSelectedAccountId(accs[0].id);
                }
            } catch (err) {
                console.error(err);
                toast.error('Failed to load accounts');
            } finally {
                setLoadingAccounts(false);
            }
        };
        loadAccounts();
    }, [user]);

    // Load credit cards when selected account changes
    useEffect(() => {
        const loadCards = async () => {
            if (selectedAccountId === '') return;
            setLoadingCards(true);
            try {
                const accCards = await getAccountCards(selectedAccountId);
                setCards(accCards);
            } catch (err) {
                console.error(err);
                toast.error('Failed to load cards');
            } finally {
                setLoadingCards(false);
            }
        };
        loadCards();
    }, [selectedAccountId]);

    const renderCardIcon = (type: string) => {
        switch (type) {
            case 'VISA':
                return <FaCcVisa className="text-2xl text-blue-600 mr-2" />;
            case 'MASTERCARD':
                return <FaCcMastercard className="text-2xl text-red-600 mr-2" />;
            case 'AMERICAN_EXPRESS':
                return <FaCcAmex className="text-2xl text-green-600 mr-2" />;
            case 'DISCOVER':
                return <FaCcDiscover className="text-2xl text-orange-600 mr-2" />;
            default:
                return <FaCreditCard className="text-2xl text-gray-600 mr-2" />;
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-8">
            <h1 className="text-2xl font-bold flex items-center mb-6">
                <FaCreditCard className="mr-2 text-blue-600" /> My Credit Cards
            </h1>

            {/* Account Selection */}
            {loadingAccounts ? (
                <LoadingScreen />
            ) : (
                <div className="mb-6">
                    <label htmlFor="accountSelect" className="block mb-2 font-medium">
                        Select Account:
                    </label>
                    <select
                        id="accountSelect"
                        value={selectedAccountId}
                        onChange={e => setSelectedAccountId(Number(e.target.value))}
                        className="w-full border rounded p-2"
                    >
                        {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>
                                {acc.accountNumber} — Balance: ${acc.balance.toFixed(2)}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Credit Cards Display */}
            {loadingCards ? (
                <LoadingScreen />
            ) : cards.length === 0 ? (
                <p className="text-center text-gray-600">No credit cards found for this account.</p>
            ) : (
                <div className="space-y-4">
                    {cards.map(card => (
                        <Link
                            key={card.id}
                            href={`/credit-cards/${card.id}`}
                            className="flex items-center border p-4 rounded shadow-sm hover:bg-gray-50"
                        >
                            {renderCardIcon(card.cardType)}
                            <div className="flex-1">
                                <div className="font-semibold mb-1">{card.cardHolderName}</div>
                                <div className="text-gray-600 mb-1">{card.cardNumber}</div>
                                <div className="text-sm text-gray-500">
                                    Expires: {card.expiryDate} • Limit: ${card.creditLimit.toFixed(2)} • Available: ${card.availableBalance.toFixed(2)}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
