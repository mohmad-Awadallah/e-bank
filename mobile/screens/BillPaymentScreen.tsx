// screens/BillPaymentScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { api, Account, CreateBillPaymentInput } from '../services/apiService';
import Icon from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-toast-message';

export default function BillPaymentScreen() {
    const navigation = useNavigation();
    const { user } = useAuth();

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [formData, setFormData] = useState({
        billerCode: '',
        description: '',
        amount: ''
    });
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const fetchAccounts = async () => {
            if (!user?.id) return;
            try {
                const accs = await api.getUserAccounts(user.id.toString());
                setAccounts(accs.data);
                if (accs.data.length) setSelectedAccountId(accs.data[0].id.toString());
            } catch {
                Toast.show({
                    type: 'error',
                    text1: 'Failed to load accounts',
                });
            }
        };
        fetchAccounts();
    }, [user]);

    const handleSubmit = async () => {
        if (!selectedAccountId) {
            Toast.show({
                type: 'error',
                text1: 'Please select an account',
            });
            return;
        }

        const amountNum = parseFloat(formData.amount);
        if (isNaN(amountNum)) {
            Toast.show({
                type: 'error',
                text1: 'Invalid amount',
            });
            return;
        }

        setLoading(true);
        try {
            const input: CreateBillPaymentInput = {
                accountId: selectedAccountId,
                billerCode: formData.billerCode,
                description: formData.description,
                amount: amountNum
            };

            await api.createBillPayment(input);
            setIsSuccess(true);
            Toast.show({ type: 'success', text1: 'Payment successful' });

            setTimeout(() => navigation.navigate('PaymentHistory' as never), 2000);
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Payment failed',
                text2: error instanceof Error ? error.message : 'Unknown error'
            });
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (isSuccess) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50 p-4">
                <Icon name="check-circle" size={64} color="#16a34a" />
                <Text className="text-2xl font-bold mt-4 text-gray-800">Payment Successful!</Text>
                <Text className="text-gray-600 mt-2 text-center">
                    Your bill has been paid successfully
                </Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerClassName="p-4 bg-gray-50">
            {/* Header */}
            <View className="flex-row items-center gap-2 mb-6">
                <Icon name="file-text-o" size={24} color="#2563eb" />
                <Text className="text-2xl font-semibold text-gray-800">Pay a Bill</Text>
            </View>

            {/* Account Picker */}
            <View className="mb-4">
                <View className="flex-row items-center gap-2 mb-2">
                    <Icon name="credit-card" size={18} color="#2563eb" />
                    <Text className="text-sm font-medium text-gray-700">Select Account</Text>
                </View>
                <View className="border border-gray-300 rounded-lg">
                    <Picker
                        selectedValue={selectedAccountId}
                        onValueChange={setSelectedAccountId}
                        className="h-12 text-gray-800"
                    >
                        {accounts.map(acc => (
                            <Picker.Item
                                key={acc.id}
                                label={`${acc.accountNumber} - ${acc.currency} ${acc.balance.toFixed(2)}`}
                                value={acc.id.toString()}
                            />
                        ))}
                    </Picker>
                </View>
            </View>

            {/* Biller Code Input */}
            <View className="mb-4">
                <View className="flex-row items-center gap-2 mb-2">
                    <Icon name="barcode" size={18} color="#2563eb" />
                    <Text className="text-sm font-medium text-gray-700">Biller Code</Text>
                </View>
                <TextInput
                    className="border border-gray-300 rounded-lg p-3 text-gray-800"
                    placeholder="Enter biller code"
                    value={formData.billerCode}
                    onChangeText={text => setFormData({ ...formData, billerCode: text })}
                />
            </View>

            {/* Description Input */}
            <View className="mb-4">
                <View className="flex-row items-center gap-2 mb-2">
                    <Icon name="user" size={18} color="#2563eb" />
                    <Text className="text-sm font-medium text-gray-700">Customer Reference</Text>
                </View>
                <TextInput
                    className="border border-gray-300 rounded-lg p-3 text-gray-800"
                    placeholder="Enter reference"
                    value={formData.description}
                    onChangeText={text => setFormData({ ...formData, description: text })}
                />
            </View>

            {/* Amount Input */}
            <View className="mb-6">
                <View className="flex-row items-center gap-2 mb-2">
                    <Icon name="money" size={18} color="#2563eb" />
                    <Text className="text-sm font-medium text-gray-700">Amount</Text>
                </View>
                <TextInput
                    className="border border-gray-300 rounded-lg p-3 text-gray-800"
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={formData.amount}
                    onChangeText={text => setFormData({ ...formData, amount: text })}
                />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
                className={`bg-blue-600 rounded-lg p-4 items-center ${loading ? 'opacity-50' : 'active:bg-blue-700'
                    }`}
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <View className="flex-row items-center gap-2">
                        <Icon name="send" size={20} color="white" />
                        <Text className="text-white font-medium text-base">Submit Payment</Text>
                    </View>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}