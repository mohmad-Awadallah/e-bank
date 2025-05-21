// screens/CreditCardDetailsScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import { api, CreditCardResponseDTO, CardType } from '../services/apiService';
import Icon from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-toast-message';

type RootStackParamList = {
    CreditCards: undefined;
    CreditCardDetails: { cardId: number };
};

export default function CreditCardDetailsScreen() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const route = useRoute();
    const { cardId } = route.params as { cardId: number };
    
    const [card, setCard] = useState<CreditCardResponseDTO | null>(null);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(true);
    const [isPaying, setIsPaying] = useState(false);

    const cardTypeIcons = {
        [CardType.VISA]: 'cc-visa',
        [CardType.MASTERCARD]: 'cc-mastercard',
        [CardType.AMERICAN_EXPRESS]: 'cc-amex',
        [CardType.DISCOVER]: 'cc-discover'
    };

    useEffect(() => {
        const loadCard = async () => {
            try {
                const data = await api.getCardDetails(cardId);
                setCard(data);
            } catch {
                Toast.show({ type: 'error', text1: 'Failed to load card details' });
            } finally {
                setLoading(false);
            }
        };
        loadCard();
    }, [cardId]);

    const handlePayment = async () => {
        const payAmount = parseFloat(amount);
        if (isNaN(payAmount)) {
            Toast.show({ type: 'error', text1: 'Please enter valid amount' });
            return;
        }

        setIsPaying(true);
        try {
            await api.makeCreditCardPayment(cardId, payAmount);
            Toast.show({ type: 'success', text1: 'Payment successful' });
            
            // Refresh card data
            const updated = await api.getCardDetails(cardId);
            setCard(updated);
            setAmount('');
        } catch {
            Toast.show({ type: 'error', text1: 'Payment failed' });
        } finally {
            setIsPaying(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    if (!card) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="text-red-500">Card not found</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerClassName="p-4 bg-gray-50">
            {/* Header */}
            <TouchableOpacity 
                onPress={() => navigation.navigate('CreditCards')}
                className="mb-4 flex-row items-center"
            >
                <Icon name="arrow-left" size={20} color="#2563eb" />
                <Text className="text-blue-600 ml-2">Back to Cards</Text>
            </TouchableOpacity>

            <View className="bg-white rounded-xl p-4 shadow-sm">
                <View className="flex-row items-center mb-4">
                    <Icon name="credit-card" size={24} color="#2563eb" />
                    <Text className="text-2xl font-semibold ml-2 text-gray-800">Card Details</Text>
                </View>

                {/* Card Info */}
                <View className="space-y-4">
                    {[
                        { icon: 'user', label: 'Holder', value: card.cardHolderName },
                        { icon: 'credit-card', label: 'Number', value: `•••• •••• •••• ${card.cardNumber.slice(-4)}` },
                        { icon: cardTypeIcons[card.cardType], label: 'Type', value: card.cardType },
                        { icon: 'money', label: 'Limit', value: `$${card.creditLimit.toFixed(2)}` },
                        { icon: 'calendar', label: 'Expires', value: card.expiryDate },
                        { icon: 'check-circle', label: 'Status', value: card.isActive ? 'Active' : 'Inactive' },
                    ].map((item, index) => (
                        <View key={index} className="flex-row items-center">
                            <Icon 
                                name={item.icon as any} 
                                size={20} 
                                color="#6b7280" 
                                className="mr-3"
                            />
                            <View>
                                <Text className="text-sm text-gray-500">{item.label}</Text>
                                <Text className="text-base text-gray-800">{item.value}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Payment Form */}
                <View className="mt-6 pt-4 border-t border-gray-200">
                    <View className="flex-row items-center mb-4">
                        <Icon name="money" size={20} color="#16a34a" />
                        <Text className="text-lg font-semibold ml-2 text-gray-800">Make Payment</Text>
                    </View>

                    <View className="flex-row items-center space-x-2">
                        <TextInput
                            className="flex-1 border border-gray-300 rounded-lg p-2"
                            placeholder="Amount"
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                        />
                        <TouchableOpacity
                            className={`px-4 py-2 rounded-lg ${isPaying ? 'bg-green-400' : 'bg-green-600'}`}
                            onPress={handlePayment}
                            disabled={isPaying}
                        >
                            {isPaying ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-medium">Pay</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <Toast />
        </ScrollView>
    );
}