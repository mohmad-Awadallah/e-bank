// screens/CreditCardsScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../contexts/AuthContext';
import { api, Account, CreditCardResponseDTO, CardType } from '../services/apiService';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';

export type RootStackParamList = {
    CreditCardsScreen: undefined;
    CreditCardDetails: { cardId: number };
};

export default function CreditCardsScreen() {
    type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreditCardsScreen'>;
    const navigation = useNavigation<NavigationProp>();
    const { user } = useAuth();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccountId, setSelectedAccountId] = useState<number>(0);
    const [cards, setCards] = useState<CreditCardResponseDTO[]>([]);
    const [loadingAccounts, setLoadingAccounts] = useState(true);
    const [loadingCards, setLoadingCards] = useState(false);

    const cardTypeIcons = {
        [CardType.VISA]: 'cc-visa',
        [CardType.MASTERCARD]: 'cc-mastercard',
        [CardType.AMERICAN_EXPRESS]: 'cc-amex',
        [CardType.DISCOVER]: 'cc-discover'
    };

    // Load user accounts
    useEffect(() => {
        const loadAccounts = async () => {
            if (!user?.id) return;
            try {
                const accsResponse = await api.getUserAccounts(user.id.toString());
                setAccounts(accsResponse.data);
                if (accsResponse.data.length > 0) setSelectedAccountId(accsResponse.data[0].id);
            } catch {
                Toast.show({ type: 'error', text1: 'Failed to load accounts' });
            } finally {
                setLoadingAccounts(false);
            }
        };
        loadAccounts();
    }, [user]);

    // Load cards when account changes
    useEffect(() => {
        const loadCards = async () => {
            if (!selectedAccountId) return;
            setLoadingCards(true);
            try {
                const accCards = await api.getAccountCards(selectedAccountId);
                setCards(accCards);
            } catch {
                Toast.show({ type: 'error', text1: 'Failed to load cards' });
            } finally {
                setLoadingCards(false);
            }
        };
        loadCards();
    }, [selectedAccountId]);

    const renderCardItem = (card: CreditCardResponseDTO) => (
        <TouchableOpacity
            key={card.id}
            className="bg-white p-4 rounded-lg shadow-sm mb-3"
            onPress={() => navigation.navigate('CreditCardDetails', { cardId: card.id })}
        >
            <View className="flex-row items-center mb-2">
                <Icon
                    name={cardTypeIcons[card.cardType]}
                    size={28}
                    color={
                        card.cardType === CardType.VISA ? '#1a1f71' :
                            card.cardType === CardType.MASTERCARD ? '#eb001b' :
                                card.cardType === CardType.AMERICAN_EXPRESS ? '#016FD0' :
                                    '#FF6000'
                    }
                />
                <View className="ml-3 flex-1">
                    <Text className="font-semibold text-lg">{card.cardHolderName}</Text>
                    <Text className="text-gray-600">•••• •••• •••• {card.cardNumber.slice(-4)}</Text>
                </View>
            </View>

            <View className="flex-row justify-between">
                <View>
                    <Text className="text-sm text-gray-500">Expires</Text>
                    <Text className="font-medium">{card.expiryDate}</Text>
                </View>

                <View>
                    <Text className="text-sm text-gray-500">Available</Text>
                    <Text className="font-medium text-green-600">
                        ${card.availableBalance.toFixed(2)}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loadingAccounts) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <ScrollView contentContainerClassName="p-4 bg-gray-50">
            {/* Header */}
            <View className="flex-row items-center mb-6">
                <Icon name="credit-card" size={24} color="#2563eb" />
                <Text className="text-2xl font-semibold ml-2 text-gray-800">My Credit Cards</Text>
            </View>

            {/* Account Selection */}
            <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">Select Account</Text>
                <View className="border border-gray-300 rounded-lg">
                    <Picker
                        selectedValue={selectedAccountId}
                        onValueChange={(value) => setSelectedAccountId(value)}
                        className="h-12 text-gray-800"
                    >
                        {accounts.map(acc => (
                            <Picker.Item
                                key={acc.id}
                                label={`${acc.accountNumber} - $${acc.balance.toFixed(2)}`}
                                value={acc.id}
                            />
                        ))}
                    </Picker>
                </View>
            </View>

            {/* Loading Cards */}
            {loadingCards ? (
                <ActivityIndicator size="small" color="#2563eb" />
            ) : cards.length === 0 ? (
                <View className="flex-1 justify-center items-center mt-10">
                    <Icon name="credit-card" size={40} color="#6b7280" />
                    <Text className="text-gray-600 mt-4">No credit cards found</Text>
                </View>
            ) : (
                <View className="mb-4">
                    {cards.map(renderCardItem)}
                </View>
            )}

            <Toast />
        </ScrollView>
    );
}