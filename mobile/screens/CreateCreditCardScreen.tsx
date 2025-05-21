// screens/CreateCreditCardScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { api, CardType } from '../services/apiService';
import Icon from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-toast-message';

type RootStackParamList = {
    CreditCards: undefined;
}

export default function CreateCreditCardScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { user } = useAuth();
    const [accounts, setAccounts] = useState<{ id: string; accountNumber: string }[]>([]);
    const [selectedAccount, setSelectedAccount] = useState('');
    const [cardHolder, setCardHolder] = useState('');
    const [cardType, setCardType] = useState<CardType>(CardType.VISA);
    const [creditLimit, setCreditLimit] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadAccounts = async () => {
            if (!user?.id) return;
            try {
                const accsResponse = await api.getUserAccounts(user.id.toString());
                const formatted = accsResponse.data.map((acc: any) => ({
                    id: acc.id.toString(),
                    accountNumber: acc.accountNumber
                }));
                setAccounts(formatted);
                if (formatted.length > 0) setSelectedAccount(formatted[0].id);
            } catch {
                Toast.show({ type: 'error', text1: 'Failed to load accounts' });
            }
        };
        loadAccounts();
    }, [user]);

    useEffect(() => {
        if (user?.firstName && user?.lastName) {
            setCardHolder(`${user.firstName} ${user.lastName}`);
        }
    }, [user]);

    const handleSubmit = async () => {
        if (!selectedAccount) {
            Toast.show({ type: 'error', text1: 'Please select an account' });
            return;
        }

        setLoading(true);
        try {
            await api.issueCreditCard({
                accountId: Number(selectedAccount),
                cardHolderName: cardHolder,
                cardType,
                creditLimit: parseFloat(creditLimit),
            });
            Toast.show({ type: 'success', text1: 'Card issued successfully' });
            setTimeout(() => navigation.navigate('CreditCards' as never), 2000);
        } catch {
            Toast.show({ type: 'error', text1: 'Failed to issue card' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={{ padding: 16, backgroundColor: '#f9fafb' }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                <Icon name="credit-card" size={24} color="#2563eb" />
                <Text style={{ fontSize: 24, fontWeight: '600', marginLeft: 8, color: '#1f2937' }}>
                    Issue Credit Card
                </Text>
            </View>

            {/* Account Selection */}
            <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                    Select Account
                </Text>
                <View style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
                        <Icon name="university" size={20} color="#6b7280" />
                        <Picker
                            selectedValue={selectedAccount}
                            onValueChange={setSelectedAccount}
                            style={{ flex: 1, height: 48, color: '#1f2937' }}
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
            </View>

            {/* Card Holder Name */}
            <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                    Card Holder
                </Text>
                <View style={{
                    borderWidth: 1,
                    borderColor: '#d1d5db',
                    borderRadius: 8,
                    padding: 12,
                    backgroundColor: '#f3f4f6',
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    <Icon name="user" size={20} color="#6b7280" style={{ marginRight: 8 }} />
                    <Text style={{ color: '#1f2937' }}>{cardHolder}</Text>
                </View>
            </View>

            {/* Card Type Selection */}
            <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                    Card Type
                </Text>
                <View style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
                        <Icon
                            name={
                                cardType === CardType.VISA ? 'cc-visa' :
                                    cardType === CardType.MASTERCARD ? 'cc-mastercard' :
                                        cardType === CardType.AMERICAN_EXPRESS ? 'cc-amex' :
                                            'cc-discover'
                            }
                            size={20}
                            color="#6b7280"
                            style={{ marginRight: 8 }}
                        />
                        <Picker
                            selectedValue={cardType}
                            onValueChange={value => setCardType(value as CardType)}
                            style={{ flex: 1, height: 48, color: '#1f2937' }}
                        >
                            <Picker.Item label="Visa" value={CardType.VISA} />
                            <Picker.Item label="MasterCard" value={CardType.MASTERCARD} />
                            <Picker.Item label="American Express" value={CardType.AMERICAN_EXPRESS} />
                            <Picker.Item label="Discover" value={CardType.DISCOVER} />
                        </Picker>
                    </View>
                </View>
            </View>

            {/* Credit Limit Input */}
            <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                    Credit Limit ($)
                </Text>
                <View style={{
                    borderWidth: 1,
                    borderColor: '#d1d5db',
                    borderRadius: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 12
                }}>
                    <Icon name="dollar" size={20} color="#6b7280" style={{ marginRight: 8 }} />
                    <TextInput
                        style={{ flex: 1, height: 48, color: '#1f2937' }}
                        placeholder="Enter credit limit"
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                        value={creditLimit}
                        onChangeText={setCreditLimit}
                    />
                </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
                style={{
                    backgroundColor: '#2563eb',
                    borderRadius: 8,
                    padding: 16,
                    alignItems: 'center',
                    opacity: loading ? 0.5 : 1
                }}
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={{ color: 'white', fontWeight: '500', fontSize: 16 }}>
                        Issue Card
                    </Text>
                )}
            </TouchableOpacity>

            <Toast />
        </ScrollView>
    );
}