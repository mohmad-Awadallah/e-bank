// screens/TransferScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { api, Account, TransactionType } from '../services/apiService';
import Icon from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Toast from 'react-native-toast-message';

const transactionTypes: TransactionType[] = [
    'TRANSFER',
    'DEPOSIT',
    'WITHDRAWAL',
    'PAYMENT',
    'REVERSAL',
];

export default function TransferScreen() {
    const navigation = useNavigation();
    const { user, isAuthenticated } = useAuth();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [sourceAccount, setSourceAccount] = useState('');
    const [targetAccount, setTargetAccount] = useState('');
    const [amount, setAmount] = useState('');
    const [reference, setReference] = useState('');
    const [type, setType] = useState<TransactionType>('TRANSFER');
    const [loading, setLoading] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const fetchAccounts = async () => {
            if (!user?.id) return;
            try {
                const res = await api.getUserAccounts(user.id.toString());
                setAccounts(res.data);
                if (res.data.length) setSourceAccount(res.data[0].accountNumber);
            } catch {
                Toast.show({
                    type: 'error',
                    text1: 'Failed to load accounts',
                });
            }
        };
        fetchAccounts();
    }, [user]);

    const handleSubmit = () => {
        if (!sourceAccount || !targetAccount || !amount || !reference) {
            Toast.show({ type: 'error', text1: 'All fields are required' });
            return;
        }

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount)) {
            Toast.show({ type: 'error', text1: 'Invalid amount format' });
            return;
        }

        setShowConfirmation(true);
    };

    const confirmTransfer = async () => {
        setShowConfirmation(false);
        setLoading(true);
        try {
            await api.makeTransfer({
                sourceAccountNumber: sourceAccount,
                targetAccountNumber: targetAccount,
                amount: parseFloat(amount),
                reference,
                type,
            });
            setIsSuccess(true);
            Toast.show({ type: 'success', text1: 'Transfer successful!' });
            setTimeout(() => navigation.navigate('Transactions' as never), 2000);
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Transfer failed',
                text2: error instanceof Error ? error.message : 'Unknown error',
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="text-gray-600">Please log in first</Text>
            </View>
        );
    }

    if (isSuccess) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50 p-4">
                <AntDesign name="checkcircle" size={64} color="#16a34a" />
                <Text className="text-2xl font-bold mt-4 text-gray-800">Transfer Successful!</Text>
                <Text className="text-gray-600 mt-2 text-center">
                    Your transfer of {parseFloat(amount).toFixed(2)} was completed
                </Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerClassName="p-4 bg-gray-50">
            {/* Header */}
            <View className="flex-row items-center gap-2 mb-6">
                <Icon name="send" size={24} className="text-blue-600" />
                <Text className="text-2xl font-semibold text-gray-800">Transfer Funds</Text>
            </View>

            {/* Transaction Type Picker */}
            <View className="mb-4">
                <View className="flex-row items-center gap-2 mb-2">
                    <Icon name="repeat" size={18} className="text-gray-700" />
                    <Text className="text-sm font-medium text-gray-700">Transaction Type</Text>
                </View>
                <View className="border border-gray-300 rounded-lg">
                    <Picker
                        selectedValue={type}
                        onValueChange={(val) => setType(val)}
                        className="h-12 text-gray-800"
                    >
                        {transactionTypes.map(t => (
                            <Picker.Item
                                key={t}
                                label={t.charAt(0) + t.slice(1).toLowerCase()}
                                value={t}
                            />
                        ))}
                    </Picker>
                </View>
            </View>

            {/* Source Account Picker */}
            <View className="mb-4">
                <View className="flex-row items-center gap-2 mb-2">
                    <Icon name="credit-card" size={18} className="text-gray-700" />
                    <Text className="text-sm font-medium text-gray-700">Source Account</Text>
                </View>
                <View className="border border-gray-300 rounded-lg">
                    <Picker
                        selectedValue={sourceAccount}
                        onValueChange={setSourceAccount}
                        className="h-12 text-gray-800"
                    >
                        {accounts.map(acc => (
                            <Picker.Item
                                key={acc.id}
                                label={`${acc.accountNumber} - ${acc.currency} ${acc.balance.toFixed(2)}`}
                                value={acc.accountNumber}
                            />
                        ))}
                    </Picker>
                </View>
            </View>

            {/* Target Account Input */}
            <View className="mb-4">
                <View className="flex-row items-center gap-2 mb-2">
                    <Icon name="credit-card" size={18} className="text-gray-700" />
                    <Text className="text-sm font-medium text-gray-700">Target Account</Text>
                </View>
                <TextInput
                    className="border border-gray-300 rounded-lg p-3 text-gray-800"
                    placeholder="Enter target account number"
                    value={targetAccount}
                    onChangeText={setTargetAccount}
                />
            </View>

            {/* Amount Input */}
            <View className="mb-4">
                <View className="flex-row items-center gap-2 mb-2">
                    <Icon name="dollar-sign" size={18} className="text-gray-700" />
                    <Text className="text-sm font-medium text-gray-700">Amount</Text>
                </View>
                <TextInput
                    className="border border-gray-300 rounded-lg p-3 text-gray-800"
                    placeholder="0.00"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                />
            </View>

            {/* Reference Input */}
            <View className="mb-6">
                <View className="flex-row items-center gap-2 mb-2">
                    <Icon name="edit-3" size={18} className="text-gray-700" />
                    <Text className="text-sm font-medium text-gray-700">Reference</Text>
                </View>
                <TextInput
                    className="border border-gray-300 rounded-lg p-3 text-gray-800"
                    placeholder="Enter reference"
                    value={reference}
                    onChangeText={setReference}
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
                        <Icon name="send" size={20} className="text-white" />
                        <Text className="text-white font-medium text-base">Transfer</Text>
                    </View>
                )}
            </TouchableOpacity>

            {/* Confirmation Modal */}
            <Modal visible={showConfirmation} transparent animationType="fade">
                <View className="flex-1 justify-center items-center bg-black/50 p-4">
                    <View className="bg-white rounded-xl p-6 w-full max-w-sm">
                        <View className="items-center mb-4">
                            <AntDesign name="questioncircle" size={48} color="#eab308" />
                        </View>
                        <Text className="text-lg font-semibold text-center mb-4">
                            Confirm Transfer
                        </Text>
                        <Text className="text-gray-600 text-center mb-6">
                            Transfer {parseFloat(amount).toFixed(2)} to {targetAccount}?
                        </Text>

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                className="flex-1 bg-gray-300 rounded-lg p-3"
                                onPress={() => setShowConfirmation(false)}
                            >
                                <Text className="text-gray-800 text-center font-medium">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 bg-blue-600 rounded-lg p-3"
                                onPress={confirmTransfer}
                            >
                                <Text className="text-white text-center font-medium">Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Toast />
        </ScrollView>
    );
}