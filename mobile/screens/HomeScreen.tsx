// screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, FlatList, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import MobileFooter from '../components/MobileFooter';



const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 32 - 16) / 2;  // 16px padding + 16px gap

type Rates = {
    [key: string]: number;
};

function ExchangeRates() {
    const [rates, setRates] = useState<Rates | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<boolean>(false);
    const currencies = ['EUR', 'GBP', 'JPY', 'AED', 'SAR'];

    useEffect(() => {
        let isMounted = true;
        axios.get('https://api.exchangerate-api.com/v4/latest/USD')
            .then(res => {
                if (isMounted) setRates(res.data.rates);
            })
            .catch(() => {
                if (isMounted) setError(true);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });
        return () => { isMounted = false; };
    }, []);

    if (loading) return <ActivityIndicator className="mt-4" />;
    if (error || !rates) return (
        <Text className="text-center text-red-500 mt-4">
            Failed to load rates
        </Text>
    );

    return (
        <FlatList
            data={currencies}
            numColumns={2}
            keyExtractor={(item) => item}
            columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
            renderItem={({ item: currency }) => (
                <View className="p-4 bg-blue-50 rounded-xl"
                    style={{ width: CARD_WIDTH }}
                >
                    <View className="flex-row justify-between mb-1">
                        <Text className="font-bold text-lg">{currency}</Text>
                        <Text className="text-blue-600">
                            {rates[currency]?.toFixed(2) ?? 'N/A'}
                        </Text>
                    </View>
                    <Text className="text-sm text-gray-500">
                        1 USD = {currency}
                    </Text>
                </View>
            )}
        />
    );
}



const features = [
    {
        title: 'Instant Transfers',
        description: 'Send and receive money in seconds',
        icon: <MaterialCommunityIcons name="bank-transfer" size={32} color="#2563eb" />,
    },
    {
        title: 'Secure Payments',
        description: 'Pay bills securely and easily',
        icon: <FontAwesome5 name="money-check-alt" size={28} color="#2563eb" />,
    },
    {
        title: 'Account Management',
        description: 'Track your financial transactions easily',
        icon: <Ionicons name="person-circle-outline" size={32} color="#2563eb" />,
    },
    {
        title: '24/7 Support',
        description: 'Customer service available around the clock',
        icon: <Ionicons name="headset" size={32} color="#2563eb" />,
    },
];



export default function HomeScreen() {
    const navigation = useNavigation<any>();

    return (
        <ScrollView className="flex-1 bg-blue-50 px-4 pt-6">
            {/* Main Section */}
            <View className="mb-6">
                <Text className="text-3xl font-bold text-gray-800 mb-2">
                    The Leading Digital Bank
                </Text>
                <Text className="text-2xl text-blue-600 mb-4 font-semibold">
                    to Manage Your Money Smartly
                </Text>
                <Text className="text-gray-700 mb-6 text-base leading-relaxed">
                    Innovative banking solutions that give you complete control over your funds anytime, anywhere.
                </Text>

                <TouchableOpacity
                    onPress={() => navigation.navigate('Register')}
                    className="bg-blue-600 p-4 rounded-xl"
                >
                    <Text className="text-white text-center font-semibold text-lg">
                        Start Now for Free
                    </Text>
                </TouchableOpacity>
            </View>

            {/* App Illustration */}
            <View className="mb-6 rounded-2xl overflow-hidden bg-blue-100">
                <Image
                    source={require('../assets/illustration.png')}
                    style={{ width: '100%', height: 200 }}
                    resizeMode="cover"
                />
            </View>

            {/* Exchange Rates */}
            <View className="mb-8 bg-white p-4 rounded-2xl shadow">
                <Text className="text-2xl font-bold text-center text-gray-800 mb-4">
                    Live Exchange Rates
                </Text>
                <ExchangeRates />
            </View>

            <View className="mb-12 bg-white p-4 rounded-2xl shadow">
                <Text className="text-2xl font-bold text-center text-gray-800 mb-6">
                    Why Choose E-Bank?
                </Text>

                <FlatList
                    data={features}
                    numColumns={2}
                    keyExtractor={(item, index) => index.toString()}
                    columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 16 }}
                    renderItem={({ item }) => (
                        <View className="bg-blue-50 p-4 rounded-xl" style={{ width: CARD_WIDTH }}>
                            <View className="mb-2">{item.icon}</View>
                            <Text className="text-lg font-semibold text-gray-800 mb-1">
                                {item.title}
                            </Text>
                            <Text className="text-gray-600 text-sm">{item.description}</Text>
                        </View>
                    )}
                />
            </View>
            <MobileFooter />
        </ScrollView>
    );
}

