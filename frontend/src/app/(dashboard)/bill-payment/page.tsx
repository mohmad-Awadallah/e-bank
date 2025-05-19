// src/app/bill-payment/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getUserAccounts, createBillPayment, CreateBillPaymentInput } from "@/services/bill-payment";
import { Account } from "@/types/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import {
    FaReceipt,
    FaCheckCircle,
    FaExclamationCircle,
    FaSpinner,
    FaWallet,
    FaBarcode,
    FaUserTag,
    FaMoneyBillWave
} from "react-icons/fa";
import { IconContext } from "react-icons";

export default function BillPaymentPage() {
    const { user } = useAuth();
    const router = useRouter();
    const userId = user?.id;

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccountId, setSelectedAccountId] = useState<string>("");

    const [formData, setFormData] = useState({ billerCode: "", description: "", amount: "" });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (!userId) return;
        getUserAccounts(userId)
            .then(setAccounts)
            .catch((err) => {
                console.error("Failed to load accounts:", err);
                setMessage({ type: "error", text: "Unable to load accounts" });
            });
    }, [userId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === "accountId") setSelectedAccountId(value);
        else setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!selectedAccountId) {
            setMessage({ type: "error", text: "Please select an account." });
            return;
        }

        const amountNum = parseFloat(formData.amount);
        if (!formData.billerCode || isNaN(amountNum) || amountNum <= 0) {
            setMessage({ type: "error", text: "Please fill in all required fields correctly." });
            return;
        }

        setLoading(true);
        try {
            const input: CreateBillPaymentInput = {
                accountId: selectedAccountId,
                billerCode: formData.billerCode,
                description: formData.description,
                amount: amountNum,
            };

            const payment = await createBillPayment(input);
            setIsSuccess(true);
            setMessage({ type: "success", text: `Payment successful. Receipt: ${payment.receiptNumber}` });
            setFormData({ billerCode: "", description: "", amount: "" });
            setSelectedAccountId("");

            setTimeout(() => router.push("/bill-payment/history"), 2000);
        } catch (err: any) {
            setMessage({ type: "error", text: err.message || "An unexpected error occurred." });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <LoadingScreen />;

    return (
        <IconContext.Provider value={{ size: "1.2em" }}>
            <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow mt-8">
                {isSuccess ? (
                    <div className="text-center py-10">
                        <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
                        <p className="text-gray-600 mb-6">Your bill has been paid successfully.</p>
                        <FaSpinner className="animate-spin text-blue-500 text-4xl" />
                        <p className="mt-2 text-gray-500">Redirecting to transactions...</p>
                    </div>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold mb-6 flex items-center">
                            <FaReceipt className="mr-2 text-blue-600" /> Pay a Bill
                        </h1>

                        {message && (
                            <div className={`mb-4 flex items-center p-3 rounded ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                }`} role="alert">
                                {message.type === "success" ? (
                                    <FaCheckCircle className="mr-2 text-green-500" />
                                ) : (
                                    <FaExclamationCircle className="mr-2 text-red-500" />
                                )}
                                <span>{message.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="accountId" className="block text-sm font-medium text-gray-700">
                                    <FaWallet className="inline mr-1 text-blue-500" /> Select Account *
                                </label>
                                <select
                                    id="accountId"
                                    name="accountId"
                                    value={selectedAccountId}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring focus:ring-blue-200"
                                >
                                    <option value="">-- Choose account --</option>
                                    {accounts.map((acct) => (
                                        <option key={acct.id} value={String(acct.id)}>
                                            {acct.accountNumber} - {acct.currency} {acct.balance.toFixed(2)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="billerCode" className="block text-sm font-medium text-gray-700">
                                    <FaBarcode className="inline mr-1 text-blue-500" /> Biller Code *
                                </label>
                                <input
                                    type="text"
                                    id="billerCode"
                                    name="billerCode"
                                    value={formData.billerCode}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring focus:ring-blue-200"
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                    <FaUserTag className="inline mr-1 text-blue-500" /> Customer Reference
                                </label>
                                <input
                                    type="text"
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring focus:ring-blue-200"
                                />
                            </div>

                            <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                                    <FaMoneyBillWave className="inline mr-1 text-blue-500" /> Amount *
                                </label>
                                <input
                                    type="number"
                                    id="amount"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    required
                                    min={0.01}
                                    step={0.01}
                                    className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring focus:ring-blue-200"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center items-center py-2 px-4 rounded-lg text-white ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} transition`}
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <FaSpinner className="animate-spin mr-2" />
                                        <LoadingScreen />
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        <FaReceipt className="mr-2" />
                                        Submit Payment
                                    </span>
                                )}
                            </button>

                        </form>
                    </>
                )}
            </div>
        </IconContext.Provider>
    );
}
