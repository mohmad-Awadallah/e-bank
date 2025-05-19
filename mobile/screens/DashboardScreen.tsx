// screens/DashboardScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
  CreditCard,
  Wallet,
  Activity as ActivityIcon,
} from 'lucide-react-native';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { api, mapApiTransactions, TransactionDisplay, Account } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';

// ------------------------- RecentTransactions Component -------------------------
function RecentTransactions({ transactions }: { transactions: TransactionDisplay[] }) {
  const navigation = useNavigation<NativeStackNavigationProp<{ Transactions: undefined }>>();

  const getIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'transfer': return <Banknote color="#6B7280" size={20} />;
      case 'payment':  return <CreditCard color="#6B7280" size={20} />;
      case 'deposit':  return <Wallet color="#6B7280" size={20} />;
      default:         return <ActivityIcon color="#6B7280" size={20} />;
    }
  };

  return (
    <View className="bg-white p-6 rounded-xl shadow-sm mb-8">
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center gap-2">
          <ActivityIcon color="#2563eb" size={24} />
          <Text className="text-xl font-semibold text-gray-800">Recent Transactions</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
          <Text className="text-blue-600">View All</Text>
        </TouchableOpacity>
      </View>

      <View>
        {transactions.length === 0 ? (
          <Text className="text-gray-500">No recent transactions.</Text>
        ) : (
          transactions.map(item => {
            // Determine positive (credit) vs negative (debit) by displayAmount sign
            const isPositive = item.displayAmount.trim().startsWith('+');
            return (
              <View
                key={item.id}
                className="flex-row justify-between items-center border-b last:border-0 py-3"
              >
                <View className="flex-row items-center gap-3">
                  {getIcon(item.category)}
                  <View>
                    <Text className="font-semibold text-gray-800">{item.title}</Text>
                    <Text className="text-sm text-gray-500">
                      {item.formattedDate} • {item.category}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-2">
                  {isPositive ? (
                    <ArrowDownCircle color="#10B981" size={20} />
                  ) : (
                    <ArrowUpCircle color="#EF4444" size={20} />
                  )}
                  <Text className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {item.displayAmount}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}

// ------------------------- DashboardScreen -------------------------
export default function DashboardScreen() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [transactions, setTransactions] = useState<TransactionDisplay[]>([]);
  const [spendingData, setSpendingData] = useState<{ labels: string[]; values: number[] } | null>(null);
  const [monthlyData, setMonthlyData] = useState<{ labels: string[]; values: number[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const screenWidth = Dimensions.get('window').width - 32;

  const initializeDashboard = useCallback(
    async (signal: AbortSignal) => {
      try {
        if (!user) return;
        setLoading(true);
        setError(null);

        const accRes = await api.getUserAccounts(user.id, { signal });
        const fetched = Array.isArray(accRes.data) ? accRes.data : [];
        setAccounts(fetched);

        const firstAcc = fetched[0]?.accountNumber;
        if (!firstAcc) {
          setLoading(false);
          return;
        }
        setSelectedAccount(firstAcc);
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || 'Failed to load data';
        setError(msg);
        Toast.show({ type: 'error', text1: 'Error', text2: msg });
      } finally {
        setLoading(false);
      }
    }, [user]
  );

  const fetchAccountData = useCallback(
    async (accountNumber: string, signal: AbortSignal) => {
      try {
        setLoading(true);
        setError(null);

        const [txRes, spendingRes, monthlyRes] = await Promise.all([
          api.getRecentTransactions(accountNumber, 10, { signal }),
          api.getSpendingData({ signal }),
          api.getMonthlyTrendsData({ signal }),
        ]);

        const sanitize = (data: { labels: string[]; values: number[] }) => ({
          labels: data.labels,
          values: data.values.map(v => isNaN(Number(v)) ? 0 : Number(v)),
        });

        setTransactions(mapApiTransactions(txRes.data));
        setSpendingData(spendingRes ? sanitize(spendingRes) : null);
        setMonthlyData(monthlyRes ? sanitize(monthlyRes) : null);
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || 'Failed to load account data';
        setError(msg);
        Toast.show({ type: 'error', text1: 'Error', text2: msg });
      } finally {
        setLoading(false);
      }
    }, []
  );

  useEffect(() => {
    const ctr = new AbortController();
    initializeDashboard(ctr.signal);
    return () => ctr.abort();
  }, [initializeDashboard]);

  useEffect(() => {
    if (!selectedAccount) return;
    const ctr = new AbortController();
    fetchAccountData(selectedAccount, ctr.signal);
    return () => ctr.abort();
  }, [selectedAccount, fetchAccountData]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-blue-600">Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-red-500">{error}</Text>
        <TouchableOpacity
          className="mt-4 bg-blue-500 px-4 py-2 rounded"
          onPress={() => initializeDashboard(new AbortController().signal)}
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, backgroundColor: '#fff' }}>
      <Text className="text-2xl font-bold text-blue-600 mb-4">
        Welcome back, {user?.firstName || 'User'}!
      </Text>

      {/* Account Picker */}
      <View className="mb-6">
        <Text className="text-lg font-medium text-gray-700 mb-2">Select Account:</Text>
        <View className="bg-gray-100 rounded-md overflow-hidden">
          <Picker
            selectedValue={selectedAccount}
            onValueChange={setSelectedAccount}
          >
            {accounts.map(acc => (
              <Picker.Item
                key={acc.accountNumber}
                label={`${acc.accountName} •••• ${acc.accountNumber.slice(-4)}`}
                value={acc.accountNumber}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Recent Transactions */}
      <RecentTransactions transactions={transactions} />

      {/* Analytics Charts */}
      {spendingData && monthlyData && (
        <View>
          <Text className="text-xl font-semibold mb-4">Spending Breakdown</Text>
          <PieChart
            data={spendingData.labels.map((l, i) => ({
              name: l,
              population: spendingData.values[i],
              color: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'][i % 4],
              legendFontColor: '#4B5563',
              legendFontSize: 12,
            }))}
            width={screenWidth}
            height={220}
            chartConfig={{
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (op: number) => `rgba(0,0,0,${op})`,
              labelColor: (op: number) => `rgba(75,85,99,${op})`,
              propsForDots: { r: '3' },
              style: { borderRadius: 12 },
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />

          <Text className="text-xl font-semibold mt-8 mb-4">Monthly Trends</Text>
          {monthlyData.values.length > 1 ? (
            <LineChart
              data={{ labels: monthlyData.labels, datasets: [{ data: monthlyData.values }] }}
              width={screenWidth}
              height={220}
              chartConfig={{
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 0,
                color: (op: number) => `rgba(0,0,0,${op})`,
                labelColor: (op: number) => `rgba(75,85,99,${op})`,
                propsForDots: { r: '3' },
                style: { borderRadius: 12 },
              }}
              bezier
              style={{ borderRadius: 12 }}
            />
          ) : (
            <Text className="text-gray-500 text-center">Insufficient data to display chart.</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}