// src/app/(dashboard)/credit-cards/[cardId]/page.tsx

"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState, FormEvent } from 'react';
import LoadingScreen from '@/components/common/LoadingScreen';
import {
    getCardDetails,
    CreditCardResponseDTO,
    makeCreditCardPayment,
} from '@/services/credit-cards';
import {
    FaCreditCard,
    FaUser,
    FaHashtag,
    FaCcVisa,
    FaCcMastercard,
    FaCcAmex,
    FaCcDiscover,
    FaCalendarAlt,
    FaDollarSign,
    FaMoneyBillWave,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { IconType } from 'react-icons';

export default function CreditCardDetailsPage() {
    const { cardId } = useParams();
    const [card, setCard] = useState<CreditCardResponseDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState('');
    const [isPaying, setIsPaying] = useState(false);

    const getCardIcon = (type: string): IconType => {
        switch (type) {
            case 'VISA':
                return FaCcVisa;
            case 'MASTERCARD':
                return FaCcMastercard;
            case 'AMERICAN_EXPRESS':
                return FaCcAmex;
            case 'DISCOVER':
                return FaCcDiscover;
            default:
                return FaCreditCard;
        }
    };

    useEffect(() => {
        async function loadCard() {
            try {
                const data = await getCardDetails(Number(cardId));
                setCard(data);
            } catch {
                toast.error('Failed to load card details');
            } finally {
                setLoading(false);
            }
        }
        loadCard();
    }, [cardId]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const payAmount = parseFloat(amount);
        if (isNaN(payAmount) || payAmount <= 0) {
            return toast.error('Please enter a valid amount');
        }

        setIsPaying(true);
        try {
            await makeCreditCardPayment(Number(cardId), payAmount);
            toast.success('Payment Successful');
            setAmount('');
            const updated = await getCardDetails(Number(cardId));
            setCard(updated);
        } catch {
            toast.error('Payment Failed');
        } finally {
            setIsPaying(false);
        }
    };

    if (loading) return <LoadingScreen />;
    if (!card) return <p>Card not found.</p>;

    const CardIcon = getCardIcon(card.cardType);

    return (
        <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-8">
            <Link href="/credit-cards" className="text-blue-600 underline mb-4 block">
                ← Back to Cards
            </Link>

            <h1 className="text-2xl font-bold flex items-center mb-6">
                <FaCreditCard className="mr-2 text-blue-600" /> Card Details
            </h1>

            <div className="space-y-4 text-gray-800">
                {[
                    { icon: FaUser, label: 'Holder', value: card.cardHolderName },
                    { icon: FaHashtag, label: 'Number', value: card.cardNumber },
                    { icon: CardIcon, label: 'Type', value: card.cardType },
                    { icon: FaDollarSign, label: 'Limit', value: `$${card.creditLimit.toFixed(2)}` },
                    { icon: FaCalendarAlt, label: 'Expires', value: card.expiryDate },
                    { icon: FaCreditCard, label: 'Active', value: card.isActive ? 'Yes' : 'No' }, // ✅ المضاف
                ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center">
                        <Icon className="mr-2 text-gray-600" />
                        <strong className="mr-1">{label}:</strong> {value}
                    </div>
                ))}
            </div>


            <form onSubmit={handleSubmit} className="mt-8 border-t pt-4 space-y-4">
                <h2 className="text-lg font-semibold flex items-center">
                    <FaMoneyBillWave className="mr-2 text-green-600" /> Make a Payment
                </h2>
                <div className="flex space-x-2">
                    <input
                        name="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="flex-1 border rounded px-3 py-2"
                    />
                    <button
                        type="submit"
                        disabled={isPaying}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                        {isPaying ? 'Processing...' : 'Pay Now'}
                    </button>
                </div>
            </form>
        </div>
    );
}