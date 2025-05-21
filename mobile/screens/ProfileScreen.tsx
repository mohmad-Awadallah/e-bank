// screens/ProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
    Settings: undefined;
};

export default function ProfileScreen() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            setError('User not authenticated');
        }
        setLoading(false);
    }, [isAuthenticated]);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 justify-center items-center px-4">
                <Text className="text-red-500 text-base">{error}</Text>
            </View>
        );
    }

    if (!isAuthenticated) {
        return (
            <View className="flex-1 justify-center items-center px-4">
                <Text className="text-base text-gray-500">Please log in first</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-gray-100 p-4">
            <View className="bg-white rounded-2xl p-5 shadow-sm">
                <Text className="text-2xl font-bold text-gray-800 mb-5">Profile Information</Text>

                <View className="flex-row flex-wrap gap-4">
                    {/* Full Name */}
                    <View className="flex-row items-center w-[48%] py-2 gap-3">
                        <Icon name="user" size={20} color="#3b82f6" />
                        <View className="flex-1">
                            <Text className="text-sm text-gray-500">Full Name</Text>
                            <Text className="text-base font-medium text-gray-800">{user?.firstName} {user?.lastName}</Text>
                        </View>
                    </View>

                    {/* Username */}
                    <View className="flex-row items-center w-[48%] py-2 gap-3">
                        <Icon name="id-card" size={20} color="#3b82f6" />
                        <View className="flex-1">
                            <Text className="text-sm text-gray-500">Username</Text>
                            <Text className="text-base font-medium text-gray-800">{user?.username}</Text>
                        </View>
                    </View>

                    {/* Email */}
                    <View className="flex-row items-center w-[48%] py-2 gap-3">
                        <Icon name="envelope" size={20} color="#3b82f6" />
                        <View className="flex-1">
                            <Text className="text-sm text-gray-500">Email</Text>
                            <Text className="text-base font-medium text-gray-800">{user?.email}</Text>
                        </View>
                    </View>

                    {/* Phone Number */}
                    <View className="flex-row items-center w-[48%] py-2 gap-3">
                        <Icon name="phone" size={20} color="#3b82f6" />
                        <View className="flex-1">
                            <Text className="text-sm text-gray-500">Phone Number</Text>
                            <Text className="text-base font-medium text-gray-800">{user?.phoneNumber || 'Not Provided'}</Text>
                        </View>
                    </View>
                </View>

                {/* Settings Button */}
                <TouchableOpacity
                    className="flex-row items-center gap-3 mt-6 p-3 bg-blue-50 rounded-lg"
                    onPress={() => navigation.navigate('Settings')}
                >
                    <Icon name="gear" size={20} color="#3b82f6" />
                    <Text className="text-base font-medium text-blue-500">Go to Settings</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
