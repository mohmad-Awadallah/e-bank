// screens/DigitalWalletScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useAuth } from '../contexts/AuthContext';
import { api, WalletDTO, WalletType } from '../services/apiService';
import Toast from 'react-native-toast-message';

export default function DigitalWalletScreen() {
    const { user } = useAuth();
    const [wallets, setWallets] = useState<WalletDTO[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Create wallet states
    const [walletType, setWalletType] = useState<WalletType>('APPLE_PAY');
    const [phoneNumber, setPhoneNumber] = useState('');
    
    // Edit phone states
    const [editingWalletId, setEditingWalletId] = useState<number | null>(null);
    const [newPhone, setNewPhone] = useState('');

    const loadWallets = React.useCallback(async () => {
        if (!user?.id) return;
        try {
            const data = await api.getUserWallets(Number(user.id));
            setWallets(data);
        } catch {
            Toast.show({ type: 'error', text1: 'Failed to load wallets' });
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadWallets();
    }, [user, loadWallets]);

    const handleCreateWallet = async () => {
        if (!user?.id) return;
        
        // Validate phone number
        if (!/^(0\d{9})$/.test(phoneNumber)) {
            Toast.show({ type: 'error', text1: 'Phone must be 10 digits starting with 0' });
            return;
        }

        try {
            await api.createWallet({
                userId: Number(user.id),
                walletType,
                phoneNumber
            });
            Toast.show({ type: 'success', text1: 'Wallet created successfully' });
            loadWallets();
            setPhoneNumber('');
        } catch {
            Toast.show({ type: 'error', text1: 'Failed to create wallet' });
        }
    };

    const handleUpdatePhone = async (walletId: number) => {
        if (!/^(0\d{9})$/.test(newPhone)) {
            Toast.show({ type: 'error', text1: 'Invalid phone format' });
            return;
        }

        try {
            await api.updateWalletPhoneNumber(walletId, newPhone);
            Toast.show({ type: 'success', text1: 'Phone updated' });
            loadWallets();
            setEditingWalletId(null);
        } catch {
            Toast.show({ type: 'error', text1: 'Update failed' });
        }
    };

    const getWalletTypeIcon = (type: WalletType) => {
        switch (type) {
            case 'APPLE_PAY': return 'apple';
            case 'GOOGLE_PAY': return 'google';
            case 'SAMSUNG_PAY': return 'mobile';
            case 'PAYPAL': return 'paypal';
            default: return 'credit-card';
        }
    };

    if (loading) {
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
                <Icon name="wallet" size={24} color="#2563eb" />
                <Text className="text-2xl font-semibold ml-2 text-gray-800">Digital Wallets</Text>
            </View>

            {/* Create Form */}
            <View className="bg-gray-100 p-4 rounded-lg mb-6">
                <Text className="text-sm font-medium mb-2">Phone Number</Text>
                <TextInput
                    className="bg-white border border-gray-300 rounded-lg p-3 mb-4"
                    placeholder="0XXXXXXXXX"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={text => setPhoneNumber(text.replace(/[^0-9]/g, ''))}
                    maxLength={10}
                />

                <Text className="text-sm font-medium mb-2">Wallet Type</Text>
                <View className="border border-gray-300 rounded-lg bg-white mb-4">
                    <Picker
                        selectedValue={walletType}
                        onValueChange={value => setWalletType(value as WalletType)}
                    >
                        <Picker.Item label="Apple Pay" value="APPLE_PAY" />
                        <Picker.Item label="Google Pay" value="GOOGLE_PAY" />
                        <Picker.Item label="Samsung Pay" value="SAMSUNG_PAY" />
                        <Picker.Item label="PayPal" value="PAYPAL" />
                        <Picker.Item label="Other" value="OTHER" />
                    </Picker>
                </View>

                <TouchableOpacity
                    className="bg-blue-600 rounded-lg p-4 items-center flex-row justify-center"
                    onPress={handleCreateWallet}
                >
                    <Icon name="plus" size={16} color="white" />
                    <Text className="text-white font-medium ml-2">Create Wallet</Text>
                </TouchableOpacity>
            </View>

            {/* Wallets List */}
            {wallets.length === 0 ? (
                <Text className="text-center text-gray-500">No wallets found</Text>
            ) : (
                <View className="space-y-4">
                    {wallets.map(wallet => (
                        <View key={wallet.id} className="bg-white p-4 rounded-lg shadow-sm">
                            <View className="flex-row justify-between items-start mb-3">
                                <View className="flex-row items-center">
                                    <Icon 
                                        name={getWalletTypeIcon(wallet.walletType)} 
                                        size={20} 
                                        color="#4f46e5" 
                                    />
                                    <Text className="ml-2 font-semibold">
                                        {wallet.walletType.replace('_', ' ')}
                                    </Text>
                                </View>
                                <Icon name="qrcode" size={24} color="#10b981" />
                            </View>

                            <View className="space-y-2">
                                <View className="flex-row items-center">
                                    <Icon name="mobile" size={16} color="#6b7280" />
                                    <Text className="ml-2 text-gray-600">
                                        {wallet.linkedPhoneNumber}
                                    </Text>
                                </View>

                                {editingWalletId === wallet.id ? (
                                    <View className="flex-row items-center gap-2 mt-2">
                                        <TextInput
                                            className="flex-1 border border-gray-300 rounded-lg p-2"
                                            value={newPhone}
                                            onChangeText={text => setNewPhone(text.replace(/[^0-9]/g, ''))}
                                            keyboardType="phone-pad"
                                        />
                                        <TouchableOpacity
                                            className="bg-green-500 px-3 py-1 rounded-lg"
                                            onPress={() => handleUpdatePhone(wallet.id)}
                                        >
                                            <Text className="text-white">Save</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            className="bg-gray-200 px-3 py-1 rounded-lg"
                                            onPress={() => setEditingWalletId(null)}
                                        >
                                            <Text className="text-gray-700">Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        className="flex-row items-center"
                                        onPress={() => {
                                            setEditingWalletId(wallet.id);
                                            setNewPhone(wallet.linkedPhoneNumber);
                                        }}
                                    >
                                        <Text className="text-blue-500 text-sm">Edit Phone</Text>
                                    </TouchableOpacity>
                                )}

                                <View className="flex-row items-center">
                                    <Icon 
                                        name={wallet.isVerified ? "check-circle" : "times-circle"} 
                                        size={16} 
                                        color={wallet.isVerified ? "#10b981" : "#ef4444"} 
                                    />
                                    <Text className={`ml-2 ${wallet.isVerified ? 'text-green-600' : 'text-red-600'}`}>
                                        {wallet.isVerified ? 'Verified' : 'Not Verified'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            <Toast />
        </ScrollView>
    );
}