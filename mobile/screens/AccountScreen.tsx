// screens/AccountScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { clsx } from 'clsx';
import { useAuth } from '../contexts/AuthContext';
import { api, Account } from '../services/apiService';
import Icon from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-toast-message';

export default function AccountScreen() {
  const { user, isAuthenticated } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [account, setAccount] = useState<Account | null>(null);
  const [amount, setAmount] = useState<string>('0');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!user?.id) throw new Error('User not recognized');
      const res = await api.getUserAccounts(user.id.toString());
      const userAccounts = res.data as Account[];
      setAccounts(userAccounts);

      if (userAccounts.length) {
        const firstId = String(userAccounts[0].id);
        setSelectedId(firstId);
        const detail = await api.getAccountDetails(firstId);
        setAccount(detail);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAccounts();
    }
  }, [isAuthenticated, fetchAccounts]);

  const handleSelect = async (id: string) => {
    setSelectedId(id);
    setLoading(true);
    try {
      const detail = await api.getAccountDetails(id);
      setAccount(detail);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const doAction = async (
    action: (id: string, amt: number) => Promise<Account>,
    successMsg: string
  ) => {
    const parsedAmount = parseFloat(amount.trim());

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Toast.show({ type: 'error', text1: 'Invalid amount', text2: 'Amount must be greater than zero.' });
      return;
    }

    if (!account) {
      Toast.show({ type: 'error', text1: 'No account selected' });
      return;
    }

    setSubmitting(true);

    try {
      await action(account.id.toString(), parsedAmount);
      Toast.show({ type: 'success', text1: successMsg });
      await fetchAccounts();
      setAmount('0');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error occurred';
      Toast.show({ type: 'error', text1: 'Operation failed', text2: message });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return <Text className="text-center mt-5 text-lg text-gray-500">Please log in first</Text>;
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return <Text className="text-center mt-5 text-lg text-red-600">{error}</Text>;
  }

  return (
    <ScrollView contentContainerClassName="p-4 bg-gray-50">
      <View className="flex-row items-center gap-2 mb-6">
        <Icon name="credit-card" size={24} className="text-gray-800" />
        <Text className="text-2xl font-semibold text-gray-800">Account Details</Text>
      </View>

      <View className="flex-row items-center gap-3 mb-5">
        <View className="flex-1 border border-gray-300 rounded-lg overflow-hidden">
          <Picker selectedValue={selectedId} onValueChange={handleSelect} className="h-12 text-gray-800">
            {accounts.map(acc => (
              <Picker.Item key={acc.id} label={acc.accountNumber} value={String(acc.id)} />
            ))}
          </Picker>
        </View>
        <TouchableOpacity onPress={fetchAccounts} className="bg-blue-600 rounded-lg p-3">
          <Icon name="refresh-cw" size={20} className="text-white" />
        </TouchableOpacity>
      </View>

      {account && (
        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <View className="flex-row items-center gap-2 mb-4">
            <Icon name="info" size={20} className="text-gray-800" />
            <Text className="text-xl font-semibold text-gray-800">Account Information</Text>
          </View>

          <View className="flex-row flex-wrap gap-3">
            <View className="w-[48%] mb-3">
              <Text className="text-sm text-gray-500 mb-1">Account Number</Text>
              <Text className="text-base font-medium text-gray-800">{account.accountNumber}</Text>
            </View>

            <View className="w-[48%] mb-3">
              <Text className="text-sm text-gray-500 mb-1">Balance</Text>
              <Text className={clsx(
                'text-base font-medium',
                account.balance === 0 ? 'text-gray-500' : 'text-green-600'
              )}>
                {account.balance === 0 ? 'No available balance' : `${account.balance.toLocaleString()} ${account.currency}`}
              </Text>
            </View>

            <View className="w-[48%] mb-3">
              <Text className="text-sm text-gray-500 mb-1">Account Type</Text>
              <Text className="text-base font-medium text-gray-800">{account.accountType.toLowerCase()}</Text>
            </View>

            <View className="w-[48%] mb-3">
              <Text className="text-sm text-gray-500 mb-1">Account Name</Text>
              <Text className="text-base font-medium text-gray-800">{account.accountName}</Text>
            </View>

            <View className="w-[48%] mb-3">
              <Text className="text-sm text-gray-500 mb-1">Status</Text>
              <Text className={clsx(
                'text-base font-medium',
                account.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'
              )}>
                {account.status}
              </Text>
            </View>
          </View>
        </View>
      )}


      <View className="bg-white rounded-xl p-4 shadow-sm">
        <View className="flex-row items-center gap-2 mb-4">
          <FontAwesome name="money" size={20} className="text-gray-800" />
          <Text className="text-xl font-semibold text-gray-800">Deposit or Withdraw Funds</Text>
        </View>

        <TextInput
          className="h-12 border border-gray-300 rounded-lg px-4 mb-4 text-base text-gray-800"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          placeholder="Enter amount"
          placeholderTextColor="#9ca3af"
          editable={!submitting}
        />

        <View className="flex-row gap-3">
          <TouchableOpacity
            className={clsx(
              'flex-1 flex-row items-center justify-center gap-2 p-3 rounded-lg',
              submitting ? 'bg-green-400' : 'bg-green-600'
            )}
            onPress={() => doAction(api.deposit, 'Deposit successful')}
            disabled={submitting}
          >
            <AntDesign name="downcircle" size={20} className="text-white" />
            <Text className="text-white text-base font-medium">Deposit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={clsx(
              'flex-1 flex-row items-center justify-center gap-2 p-3 rounded-lg',
              submitting ? 'bg-red-400' : 'bg-red-600'
            )}
            onPress={() => doAction(api.withdraw, 'Withdrawal successful')}
            disabled={submitting}
          >
            <AntDesign name="upcircle" size={20} className="text-white" />
            <Text className="text-white text-base font-medium">Withdraw</Text>
          </TouchableOpacity>
        </View>
      </View>

    </ScrollView>
  );
}