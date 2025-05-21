// screens/SettingsScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import Toast from 'react-native-toast-message';
import { api } from '../services/apiService';

type RootStackParamList = {
    Login: undefined;
};

export default function SettingsScreen() {
    const { user, isAuthenticated } = useAuth();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [loading, setLoading] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [email, setEmail] = useState(user?.email || '');
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');

    useEffect(() => {
        if (!isAuthenticated) {
            navigation.navigate('Login');
        }
    }, [isAuthenticated, navigation]);

    const validatePassword = (pwd: string) => /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/.test(pwd);
    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePhone = (phone: string) => /^[0-9()+-\s]*$/.test(phone);

    const handlePasswordChange = async () => {
        if (!currentPassword) {
            Toast.show({ type: 'error', text1: 'Please enter your current password' });
            return;
        }
        if (!validatePassword(newPassword)) {
            Toast.show({ type: 'error', text1: 'Password must be ≥8 chars, include uppercase & special char' });
            return;
        }
        if (newPassword !== confirmPassword) {
            Toast.show({ type: 'error', text1: 'New passwords do not match' });
            return;
        }

        try {
            setLoading(true);
            await api.changePassword(Number(user?.id), currentPassword, newPassword);
            Toast.show({ type: 'success', text1: 'Password changed successfully' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            const status = error?.response?.status;
            if (status === 400 || status === 500) {
                Toast.show({ type: 'error', text1: 'Incorrect current password' });
            } else {
                Toast.show({ type: 'error', text1: 'Error changing password' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async () => {
        if (!validateEmail(email)) {
            Toast.show({ type: 'error', text1: 'Invalid email address' });
            return;
        }
        if (phoneNumber && !validatePhone(phoneNumber)) {
            Toast.show({ type: 'error', text1: 'Invalid phone number' });
            return;
        }

        try {
            setLoading(true);
            await api.updateUser(Number(user?.id), { email, phoneNumber });
            Toast.show({ type: 'success', text1: 'Profile updated successfully' });
        } catch {
            Toast.show({ type: 'error', text1: 'Error updating profile' });
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated || !user?.id) {
        return (
            <View className="flex-1 justify-center items-center px-5">
                <Text className="text-lg text-red-500 text-center mb-5">You must be logged in to access settings</Text>
                <TouchableOpacity
                    className="bg-blue-500 px-5 py-3 rounded-lg"
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text className="text-white font-bold text-base">Go to Login</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-gray-100 p-4">
            <TouchableOpacity
                className="flex-row items-center mb-5"
                onPress={() => navigation.goBack()}
            >
                <Icon name="arrow-left" size={20} color="#3b82f6" />
                <Text className="text-blue-500 ml-2">Back to Dashboard</Text>
            </TouchableOpacity>

            {/* Change Password */}
            <View className="bg-white rounded-xl p-5 mb-5 shadow-md">
                <View className="flex-row items-center mb-5">
                    <Icon name="lock" size={24} color="#3b82f6" />
                    <Text className="text-xl font-semibold text-gray-800 ml-3">Change Password</Text>
                </View>

                {[
                    { value: currentPassword, show: showCurrent, setShow: setShowCurrent, setValue: setCurrentPassword, placeholder: 'Current Password' },
                    { value: newPassword, show: showNew, setShow: setShowNew, setValue: setNewPassword, placeholder: 'New Password' },
                    { value: confirmPassword, show: showConfirm, setShow: setShowConfirm, setValue: setConfirmPassword, placeholder: 'Confirm Password' },
                ].map((field, idx) => (
                    <View key={idx} className="flex-row items-center border border-gray-300 rounded-lg px-3 mb-4">
                        <Icon name="lock" size={20} color="#6b7280" className="mr-2" />
                        <TextInput
                            className="flex-1 h-12 text-base"
                            placeholder={field.placeholder}
                            secureTextEntry={!field.show}
                            value={field.value}
                            onChangeText={field.setValue}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            className="p-2"
                            onPress={() => field.setShow(!field.show)}
                        >
                            <Icon name={field.show ? 'eye-slash' : 'eye'} size={20} color="#6b7280" />
                        </TouchableOpacity>
                    </View>
                ))}

                <TouchableOpacity
                    className={`bg-blue-500 py-3 rounded-lg items-center ${loading && 'opacity-60'}`}
                    onPress={handlePasswordChange}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-semibold text-base">Change Password</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Profile Settings */}
            <View className="bg-white rounded-xl p-5 shadow-md">
                <View className="flex-row items-center mb-5">
                    <Icon name="envelope" size={24} color="#3b82f6" />
                    <Text className="text-xl font-semibold text-gray-800 ml-3">Profile Settings</Text>
                </View>

                <View className="flex-row items-center border border-gray-300 rounded-lg px-3 mb-4">
                    <Icon name="envelope" size={20} color="#6b7280" className="mr-2" />
                    <TextInput
                        className="flex-1 h-12 text-base"
                        placeholder="Email Address"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View className="flex-row items-center border border-gray-300 rounded-lg px-3 mb-4">
                    <Icon name="phone" size={20} color="#6b7280" className="mr-2" />
                    <TextInput
                        className="flex-1 h-12 text-base"
                        placeholder="Phone Number"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                    />
                </View>

                <TouchableOpacity
                    className={`bg-emerald-500 py-3 rounded-lg items-center ${loading && 'opacity-60'}`}
                    onPress={handleProfileUpdate}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-semibold text-base">Update Profile</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
