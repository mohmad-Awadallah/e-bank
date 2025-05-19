// screens/DashboardScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { api, Account, ApiTransaction, SpendingData, MonthlyTrendsData, TransactionDisplay, User } from '../services/apiService';
import { Banknote, CreditCard, Wallet, Activity as ActivityIcon, ArrowDownCircle, ArrowUpCircle } from 'lucide-react-native';

// تعريف أسماء الشاشات
export type RootDrawerParamList = {
  Dashboard: undefined;
  Transactions: undefined;
  // أضف شاشات أخرى إن وجدت
};

const screenWidth = Dimensions.get('window').width - 32;

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
  strokeWidth: 2,
  decimalPlaces: 0,
};

const getIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'transfer': return <Banknote size={20} color="#6B7280" />;
    case 'payment': return <CreditCard size={20} color="#6B7280" />;
    case 'deposit': return <Wallet size={20} color="#6B7280" />;
    default: return <ActivityIcon size={20} color="#6B7280" />;
  }
};

export default function DashboardScreen() {
  // نوع التوجيه باستخدام DrawerNavigator
  type NavigationProp = DrawerNavigationProp<RootDrawerParamList, 'Dashboard'>;
  const navigation = useNavigation<NavigationProp>();

  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<TransactionDisplay[]>([]);
  const [spending, setSpending] = useState<SpendingData | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrendsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const userData = await api.getCurrentUser().then(res => res.data);
        setUser(userData);

        const accs = await api.getUserAccounts(userData.id.toString()).then(res => res.data);
        setAccounts(accs);
        if (accs.length > 0) {
          setSelectedAccount(accs[0].accountNumber);
          setBalance(accs[0].balance);
        }

        const spend = await api.getSpendingData(accs[0].accountNumber);
        setSpending(spend);

        const trends = await api.getMonthlyTrendsData(accs[0].accountNumber);
        setMonthlyTrends(trends);

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  useEffect(() => {
    if (!selectedAccount) return;

    const loadAccountData = async () => {
      try {
        const tx = await api.getRecentTransactions(selectedAccount, 10).then(res => res.data);
        const mappedTransactions = tx.map((t: ApiTransaction) => ({
          id: t.id.toString(),
          title: t.description,
          category: t.type,
          formattedDate: new Date(t.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          displayAmount: `${t.currency} ${Math.abs(t.amount).toFixed(2)}`,
          amount: t.amount,
          isCredit: ['deposit', 'reversal'].includes(t.type.toLowerCase()),
        }));
        setTransactions(mappedTransactions);

        const spend = await api.getSpendingData(selectedAccount);
        setSpending(spend);

        const trends = await api.getMonthlyTrendsData(selectedAccount);
        setMonthlyTrends(trends);

        const selected = accounts.find(acc => acc.accountNumber === selectedAccount);
        if (selected) setBalance(selected.balance);
      } catch (error) {
        console.error('Error loading account data:', error);
      }
    };

    loadAccountData();
  }, [selectedAccount, accounts]);

  const renderTransaction = ({ item }: { item: TransactionDisplay }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {getIcon(item.category)}
        <View>
          <Text style={{ fontSize: 16, fontWeight: '500' }}>{item.title}</Text>
          <Text style={{ fontSize: 12, color: '#6B7280' }}>
            {item.formattedDate} • {item.category}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {item.isCredit ? (
          <ArrowDownCircle size={20} color="#10B981" />
        ) : (
          <ArrowUpCircle size={20} color="#EF4444" />
        )}
        <Text style={{ fontSize: 16, fontWeight: '600', color: item.isCredit ? '#16A34A' : '#DC2626' }}>
          {item.displayAmount}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 8, color: '#6B7280' }}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F9FAFB', paddingHorizontal: 16, paddingTop: 24 }} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#2563EB', marginBottom: 16 }}>
        Welcome back, {user?.firstName || 'User'}!
      </Text>

      {/* Account Selector */}
      <View style={{ backgroundColor: '#FFFFFF', padding: 16, borderRadius: 24, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>Select Account</Text>
        <View style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
          <Picker selectedValue={selectedAccount} onValueChange={setSelectedAccount}>
            {accounts.map(acc => (
              <Picker.Item key={acc.accountNumber} label={acc.accountNumber} value={acc.accountNumber} />
            ))}
          </Picker>
        </View>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#1F2937' }}>
          Balance: ${balance.toFixed(2)}
        </Text>
      </View>

      {/* Recent Transactions */}
      <View style={{ backgroundColor: '#FFFFFF', padding: 24, borderRadius: 16, marginBottom: 32, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ActivityIcon size={24} color="#2563EB" />
            <Text style={{ fontSize: 20, fontWeight: '600', color: '#1F2937' }}>Recent Transactions</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
            <Text style={{ color: '#2563EB', fontWeight: '600' }}>View All</Text>
          </TouchableOpacity>
        </View>
        <FlatList data={transactions} keyExtractor={item => item.id} renderItem={renderTransaction} />
      </View>

      {/* Spending Breakdown */}
      {spending && (
        <View style={{ backgroundColor: '#FFFFFF', padding: 16, borderRadius: 24, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16, color: '#1F2937' }}>Spending Breakdown</Text>
          <PieChart data={spending.labels.map((label, index) => ({ name: label, amount: spending.values[index], color: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'][index % 4], legendFontColor: '#7F7F7F', legendFontSize: 12 }))}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
          />
        </View>
      )}

      {/* Monthly Trends */}
      <View style={{ backgroundColor: '#FFFFFF', padding: 16, borderRadius: 24, marginBottom: 32, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16, color: '#1F2937' }}>Monthly Trends</Text>
        {monthlyTrends && monthlyTrends.values.length > 0 ? (
          <LineChart data={{ labels: monthlyTrends.labels, datasets: [{ data: monthlyTrends.values }] }} width={screenWidth} height={220} chartConfig={chartConfig} bezier />
        ) : (
          <Text style={{ textAlign: 'center', color: '#6B7280' }}>Insufficient data to display chart.</Text>
        )}
      </View>
    </ScrollView>
  );
}