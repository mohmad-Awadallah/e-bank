// screens/CreateAccountScreen.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import { useAuth } from '../contexts/AuthContext';
import { api, AccountCreationInput } from '../services/apiService';
import { twMerge } from 'tailwind-merge';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';

const ACCOUNT_TYPES = [
    { label: 'Savings', value: 'SAVINGS', icon: 'save' },
    { label: 'Current', value: 'CURRENT', icon: 'creditcard' },
    { label: 'Fixed Deposit', value: 'FIXED_DEPOSIT', icon: 'lock' },
    { label: 'Loan', value: 'LOAN', icon: 'wallet' },
    { label: 'Credit', value: 'CREDIT', icon: 'creditcard' },
];


const CURRENCIES = [
    { label: 'Saudi Riyal (SAR)', value: 'SAR', icon: 'dollar' },
    { label: 'US Dollar (USD)', value: 'USD', icon: 'dollar' },
    { label: 'Euro (EUR)', value: 'EUR', icon: 'dollar' },
];
export default function CreateAccountScreen() {
    const navigation = useNavigation();
    const { user, isAuthenticated } = useAuth();
    const [form, setForm] = useState<AccountCreationInput>({
        userId: user?.id || '',
        accountNumber: '',
        accountType: '',
        accountName: '',
        currency: '',
        initialDeposit: undefined,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.id) setForm(f => ({ ...f, userId: user.id }));
    }, [user]);

    const updateField = (key: keyof AccountCreationInput, value: any) => {
        setForm(prev => ({ ...prev, [key]: value }));
        setErrors(prev => ({ ...prev, [key]: '' }));
    };

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!form.accountName.trim()) errs.accountName = 'Required';
        if (!form.accountNumber.trim()) errs.accountNumber = 'Required';
        else if (!/^\d{10,}$/.test(form.accountNumber)) errs.accountNumber = 'At least 10 digits';
        if (!form.accountType) errs.accountType = 'Select type';
        if (!form.currency) errs.currency = 'Select currency';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        if (!user?.id) {
            Toast.show({ type: 'error', text1: 'User not authenticated' });
            return;
        }

        if (!validate()) return;

        setLoading(true);
        try {
            await api.createAccount(form);
            Toast.show({ type: 'success', text1: 'Account created successfully' });
            setTimeout(() => navigation.navigate('Account' as never), 2000);

        } catch (err: any) {
            Toast.show({ type: 'error', text1: err.message || 'Failed to create account' });
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="text-gray-500 text-base">Please login</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }} className="p-4 bg-gray-50">
            <Text className="text-2xl font-bold mb-6 text-gray-800">Create New Account</Text>

            {/* Account Name */}
            <View className="mb-4">
                <Text className="text-sm font-medium mb-1">Account Name</Text>
                <View className={twMerge("flex-row items-center border rounded-lg p-3 bg-white",
                    errors.accountName ? "border-red-500" : "border-gray-300"
                )}>
                    <Feather name="user" size={20} color="#6B7280" className="mr-2" />
                    <TextInput
                        placeholder="Personal Savings"
                        value={form.accountName}
                        onChangeText={text => updateField('accountName', text)}
                        className="flex-1 text-base text-gray-900"
                    />
                </View>
                {errors.accountName && <Text className="text-red-500 text-sm mt-1">{errors.accountName}</Text>}
            </View>

            {/* Account Number */}
            <View className="mb-4">
                <Text className="text-sm font-medium mb-1">Account Number</Text>
                <View className={twMerge("flex-row items-center border rounded-lg p-3 bg-white",
                    errors.accountNumber ? "border-red-500" : "border-gray-300"
                )}>
                    <AntDesign name="creditcard" size={20} color="#6B7280" className="mr-2" />
                    <TextInput
                        placeholder="e.g. 1234567890"
                        keyboardType="numeric"
                        value={form.accountNumber}
                        onChangeText={text => updateField('accountNumber', text)}
                        className="flex-1 text-base text-gray-900"
                    />
                </View>
                {errors.accountNumber && <Text className="text-red-500 text-sm mt-1">{errors.accountNumber}</Text>}
            </View>

            {/* Account Type */}
            <View className="mb-4">
                <Text className="text-sm font-medium mb-1">Account Type</Text>
                <View className={twMerge(
                    "flex-row items-center border rounded-lg p-3 bg-white",
                    errors.accountType ? "border-red-500" : "border-gray-300"
                )}>
                    <AntDesign
                        name="appstore1"
                        size={20}
                        color="#6B7280"
                        style={{ marginRight: 8 }}
                    />
                    <Picker
                        selectedValue={form.accountType}
                        onValueChange={val => updateField('accountType', val)}
                        style={{ flex: 1, color: '#1F2937' }}
                    >
                        <Picker.Item label="Select type..." value="" />
                        {ACCOUNT_TYPES.map(o => (
                            <Picker.Item
                                key={o.value}
                                label={o.label}
                                value={o.value}
                            />
                        ))}
                    </Picker>
                </View>
                {errors.accountType && <Text className="text-red-500 text-sm mt-1">{errors.accountType}</Text>}
            </View>

            {/* Currency */}
            <View className="mb-6">
                <Text className="text-sm font-medium mb-1">Currency</Text>
                <View className={twMerge(
                    "flex-row items-center border rounded-lg p-3 bg-white",
                    errors.currency ? "border-red-500" : "border-gray-300"
                )}>
                    <Feather
                        name="dollar-sign"
                        size={20}
                        color="#6B7280"
                        style={{ marginRight: 8 }}
                    />
                    <Picker
                        selectedValue={form.currency}
                        onValueChange={val => updateField('currency', val)}
                        style={{ flex: 1, color: '#1F2937' }}
                    >
                        <Picker.Item label="Select currency..." value="" />
                        {CURRENCIES.map(o => (
                            <Picker.Item
                                key={o.value}
                                label={o.label}
                                value={o.value}
                            />
                        ))}
                    </Picker>
                </View>
                {errors.currency && <Text className="text-red-500 text-sm mt-1">{errors.currency}</Text>}
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#2563eb" />
            ) : (
                <TouchableOpacity
                    onPress={handleSubmit}
                    className="w-full bg-blue-600 py-3 rounded-lg items-center"
                >
                    <Text className="text-white text-base font-semibold">Create Account</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
}
