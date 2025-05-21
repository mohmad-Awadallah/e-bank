// screens/BillPaymentHistoryScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../contexts/AuthContext';
import { api, BillPayment } from '../services/apiService';
import Icon from 'react-native-vector-icons/FontAwesome';
import { clsx } from 'clsx';
import Toast from 'react-native-toast-message';

export default function BillPaymentHistoryScreen() {
    const { user } = useAuth();
    const [accounts, setAccounts] = useState<{ id: string; accountNumber: string }[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
    const [paymentHistory, setPaymentHistory] = useState<BillPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAccounts = async () => {
            if (!user?.id) return;
            try {
                const accsResponse = await api.getUserAccounts(user.id.toString());
                const formattedAccounts = accsResponse.data.map((acc: any) => ({
                    ...acc,
                    id: acc.id.toString()
                }));
                setAccounts(formattedAccounts);
                if (formattedAccounts.length > 0) {
                    setSelectedAccount(formattedAccounts[0].id);
                }
            } catch {
                setError('Failed to load accounts.');
                Toast.show({ type: 'error', text1: 'Failed to load accounts' });
            }
        };
        fetchAccounts();
    }, [user]);

    useEffect(() => {
        const fetchPaymentHistory = async () => {
            if (!selectedAccount) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const data = await api.getPaymentHistory(selectedAccount);
                setPaymentHistory(data);
                setError(null);
            } catch {
                setError("Failed to fetch payment history");
                Toast.show({ type: 'error', text1: 'Failed to load history' });
            } finally {
                setLoading(false);
            }
        };
        fetchPaymentHistory();
    }, [selectedAccount]);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 justify-center items-center p-4">
                <Icon name="exclamation-circle" size={40} color="#dc2626" />
                <Text className="text-red-600 text-center mt-4">{error}</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerClassName="p-4 bg-gray-50">
            {/* Header */}
            <View className="flex-row items-center gap-2 mb-6">
                <Icon name="file-text-o" size={24} color="#2563eb" />
                <Text className="text-2xl font-semibold text-gray-800">Payment History</Text>
            </View>

            {/* Account Selector */}
            {accounts.length > 1 && (
                <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-2">Select Account:</Text>
                    <View className="border border-gray-300 rounded-lg">
                        <Picker
                            selectedValue={selectedAccount}
                            onValueChange={(value) => setSelectedAccount(value)}
                            className="h-12 text-gray-800"
                        >
                            {accounts.map(acc => (
                                <Picker.Item
                                    key={acc.id}
                                    label={acc.accountNumber}
                                    value={acc.id}
                                />
                            ))}
                        </Picker>
                    </View>
                </View>
            )}

            {/* Empty State */}
            {!error && paymentHistory.length === 0 && (
                <View className="flex-1 justify-center items-center mt-8">
                    <Icon name="folder-open-o" size={40} color="#6b7280" />
                    <Text className="text-gray-600 mt-4">No payment history found</Text>
                </View>
            )}

            {/* Payment List */}
            {paymentHistory.length > 0 && (
                <View className="bg-white rounded-xl shadow-sm">
                    {paymentHistory.map((payment) => (
                        <View 
                            key={payment.id}
                            className="p-4 border-b border-gray-200 last:border-0"
                        >
                            <View className="flex-row items-center justify-between mb-2">
                                <View className="flex-row items-center gap-2">
                                    <Icon name="check-circle" size={20} color="#16a34a" />
                                    <Text className="font-medium text-gray-800">
                                        {payment.receiptNumber}
                                    </Text>
                                </View>
                                <Text className={clsx(
                                    'font-medium',
                                    payment.amount > 0 ? 'text-green-600' : 'text-red-600'
                                )}>
                                    ${payment.amount.toFixed(2)}
                                </Text>
                            </View>

                            <View className="flex-row justify-between">
                                <View>
                                    <Text className="text-sm text-gray-600">
                                        Biller: {payment.billerCode}
                                    </Text>
                                    <Text className="text-sm text-gray-500">
                                        {new Date(payment.paymentDate).toLocaleDateString()}
                                    </Text>
                                </View>
                                {payment.description && (
                                    <Text className="text-sm text-gray-500 max-w-[40%]">
                                        {payment.description}
                                    </Text>
                                )}
                            </View>
                        </View>
                    ))}
                </View>
            )}

            <Toast />
        </ScrollView>
    );
}