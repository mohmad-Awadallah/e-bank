// screens/TransactionsScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../contexts/AuthContext';
import { api, ApiTransaction, TransactionDisplay } from '../services/apiService';
import { twMerge } from 'tailwind-merge';

// Component to render each transaction row
type TransactionRowProps = {
    tx: TransactionDisplay;
};

const getIconByType = (type: string) => {
    switch (type) {
        case 'TRANSFER':
            return <Feather name="send" size={20} color="#3b82f6" />;
        case 'DEPOSIT':
            return <Feather name="download" size={20} color="#10b981" />;
        case 'WITHDRAWAL':
            return <Feather name="upload" size={20} color="#ef4444" />;
        case 'PAYMENT':
            return <MaterialIcons name="payment" size={20} color="#f59e0b" />;
        case 'REVERSAL':
            return <Feather name="repeat" size={20} color="#8b5cf6" />;
        default:
            return <Feather name="credit-card" size={20} color="#9ca3af" />;
    }
};

const TransactionRow = ({ tx }: TransactionRowProps) => {
    const type = tx.category.toUpperCase();
    const amountColor = tx.isCredit ? 'text-green-600' : 'text-red-600';

    return (
        <TouchableOpacity className="flex-row justify-between items-center py-3 px-2 bg-white mb-px" activeOpacity={0.7}>
            <View className="flex-row items-center space-x-3">
                {getIconByType(type)}
                <View>
                    <Text className="text-base font-medium text-gray-900">{tx.title}</Text>
                    <Text className="text-xs text-gray-500">{tx.formattedDate}</Text>
                </View>
            </View>
            <Text className={twMerge("text-sm font-semibold", amountColor)}>{tx.displayAmount}</Text>
        </TouchableOpacity>
    );
};

export default function TransactionsScreen() {
    const { user, isAuthenticated } = useAuth();
    const [transactions, setTransactions] = useState<TransactionDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<'ALL' | string>('ALL');

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            if (!user?.id) throw new Error('User not recognized');
            const res = await api.getUserTransactions(user.id.toString());
            const txs = res.data as ApiTransaction[];
            const displayTxs: TransactionDisplay[] = txs.map(tx => ({
                id: tx.id.toString(),
                title: tx.description,
                category: tx.type,
                formattedDate: new Date(tx.date).toLocaleString(),
                displayAmount: `${Math.abs(tx.amount).toLocaleString()} ${tx.currency}`,
                amount: tx.amount,
                isCredit: tx.amount >= 0,
            }));
            displayTxs.sort(
                (a, b) => new Date(b.formattedDate).getTime() - new Date(a.formattedDate).getTime()
            );
            setTransactions(displayTxs);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchTransactions();
        }
    }, [isAuthenticated, fetchTransactions]);

    // داخل TransactionsScreen، غير هذا الجزء:

    const filtered = transactions.filter(tx => {
        const category = tx.category.toUpperCase();
        const filter = typeFilter.toUpperCase();

        const matchesReference = tx.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filter === 'ALL' || category === filter;
        return matchesReference && matchesType;
    });


    if (!isAuthenticated) {
        return <Text className="text-center mt-5 text-base text-gray-500">Please log in first</Text>;
    }
    if (loading) {
        return (
            <View className="flex-1 justify-center">
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }
    if (error) {
        return <Text className="text-center mt-5 text-base text-red-500">{error}</Text>;
    }

    return (
        <View className="flex-1 bg-gray-50 p-4">
            <Text className="text-xl font-bold mb-4">All Transactions</Text>

            <TextInput
                placeholder="Search by reference..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="border border-gray-300 rounded-lg px-3 py-2 mb-3"
            />

            <View className="border border-gray-300 rounded-lg mb-5">
                <Picker
                    selectedValue={typeFilter}
                    onValueChange={value => setTypeFilter(value)}
                    style={{ height: 44 }}
                >
                    <Picker.Item label="All" value="ALL" />
                    <Picker.Item label="Transfer" value="TRANSFER" />
                    <Picker.Item label="Deposit" value="DEPOSIT" />
                    <Picker.Item label="Withdrawal" value="WITHDRAWAL" />
                    <Picker.Item label="Payment" value="PAYMENT" />
                    <Picker.Item label="Reversal" value="REVERSAL" />
                </Picker>
            </View>

            {filtered.length === 0 ? (
                <Text className="text-center text-base text-gray-500">No transactions found</Text>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => <TransactionRow tx={item} />}
                    contentContainerStyle={{ paddingBottom: 32 }}
                />
            )}
        </View>
    );
}