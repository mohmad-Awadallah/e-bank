// src/app/(dashboard)/digital-wallet/page.tsx

"use client";

import { useEffect, useState } from 'react';
import { FaWallet, FaMoneyBillWave, FaPlus, FaMobileAlt, FaCheckCircle, FaTimesCircle, FaQrcode } from 'react-icons/fa';
import { getUserWallets, createWallet, WalletDTO, CreateWalletDTO, updateWalletPhoneNumber } from '@/services/wallet';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function DigitalWalletPage() {
    const { user } = useAuth();
    const [wallets, setWallets] = useState<WalletDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const [walletType, setWalletType] = useState<CreateWalletDTO['walletType']>('APPLE_PAY');
    const [phoneNumber, setPhoneNumber] = useState<string>('');

    // State for editing phone number
    const [editingPhoneId, setEditingPhoneId] = useState<number | null>(null);
    const [newPhone, setNewPhone] = useState<string>('');

    const fetchWallets = async () => {
        if (!user?.id) return;
        try {
            const data = await getUserWallets(Number(user.id));
            setWallets(data);
        } catch (error) {
            toast.error('Failed to load wallets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWallets();
    }, [user]);

    const handleCreateWallet = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;

        // Validate phone number (starts with 0 and is 10 digits long)
        if (!/^(0\d{9})$/.test(phoneNumber)) {
            toast.error('Phone number must start with 0 and be 10 digits long');
            return;
        }

        try {
            const newWallet = await createWallet({
                userId: Number(user.id),
                walletType,
                phoneNumber,
            });
            toast.success('Wallet created successfully');
            setWallets((prev) => [...prev, newWallet]);
            setPhoneNumber('');
            setWalletType('APPLE_PAY');
        } catch (error) {
            toast.error('Failed to create wallet');
        }
    };

    const handlePhoneUpdate = async (walletId: number) => {
        // Validate phone number (starts with 0 and is 10 digits long)
        if (!/^(0\d{9})$/.test(newPhone)) {
            toast.error('Phone number must start with 0 and be 10 digits long');
            return;
        }

        try {
            const updated = await updateWalletPhoneNumber(walletId, newPhone);
            setWallets((prev) =>
                prev.map((w) => (w.id === walletId ? updated : w))
            );
            toast.success('Phone number updated');
            setEditingPhoneId(null);
        } catch (error) {
            toast.error('Failed to update phone number');
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FaWallet /> Digital Wallets
            </h1>

            <form onSubmit={handleCreateWallet} className="mb-6 space-y-4 bg-gray-100 p-4 rounded-lg">
                <div>
                    <label className="block text-sm font-medium mb-1">Phone Number</label>
                    <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setPhoneNumber(value);
                        }}
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>


                <div>
                    <label className="block text-sm font-medium mb-1">Wallet Type</label>
                    <select
                        value={walletType}
                        onChange={(e) => setWalletType(e.target.value as CreateWalletDTO['walletType'])}
                        className="w-full border p-2 rounded"
                    >
                        <option value="APPLE_PAY">Apple Pay</option>
                        <option value="GOOGLE_PAY">Google Pay</option>
                        <option value="SAMSUNG_PAY">Samsung Pay</option>
                        <option value="PAYPAL">PayPal</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                >
                    <FaPlus /> Create Wallet
                </button>
            </form>

            {loading ? (
                <p>Loading...</p>
            ) : wallets.length === 0 ? (
                <p>No wallets found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {wallets.map((wallet) => (
                        <div key={wallet.id} className="p-4 border rounded-lg shadow flex justify-between items-center">
                            <div className="space-y-1">
                                <p className="flex items-center gap-2 text-lg font-semibold">
                                    <FaQrcode className="text-blue-600" />
                                    Address: {wallet.walletAddress}
                                </p>
                                <p className="flex items-center gap-2 text-gray-700">
                                    <FaWallet className="text-purple-500" />
                                    Type: {wallet.walletType}
                                </p>

                                {editingPhoneId === wallet.id ? (
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            value={newPhone}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, ''); 
                                                setNewPhone(value);
                                            }}
                                            className="border p-1 rounded"
                                        />

                                        <button
                                            onClick={() => handlePhoneUpdate(wallet.id)}
                                            className="text-sm text-green-600 hover:underline"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setEditingPhoneId(null)}
                                            className="text-sm text-gray-500 hover:underline"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <p className="flex items-center gap-2 text-gray-700">
                                        <FaMobileAlt className="text-indigo-500" />
                                        Phone: {wallet.linkedPhoneNumber}
                                        <button
                                            onClick={() => {
                                                setEditingPhoneId(wallet.id);
                                                setNewPhone(wallet.linkedPhoneNumber);
                                            }}
                                            className="text-sm text-blue-600 hover:underline ml-2"
                                        >
                                            Edit
                                        </button>
                                    </p>
                                )}

                                <p className="flex items-center gap-2 text-sm">
                                    {wallet.isVerified ? (
                                        <>
                                            <FaCheckCircle className="text-green-600" />
                                            Verified
                                        </>
                                    ) : (
                                        <>
                                            <FaTimesCircle className="text-red-600" />
                                            Not Verified
                                        </>
                                    )}
                                </p>
                            </div>
                            <FaMoneyBillWave className="text-green-600 text-2xl" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
