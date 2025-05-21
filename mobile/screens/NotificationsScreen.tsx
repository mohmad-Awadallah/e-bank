// screens/NotificationsScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { api, Notification } from '../services/apiService';
import Toast from 'react-native-toast-message';
import { format } from 'date-fns';
import { twMerge } from 'tailwind-merge';

type RootStackParamList = {
    Login: undefined;
};

export default function NotificationsScreen() {
    const { isAuthenticated, user } = useAuth();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const handleMarkAsRead = async (notificationId: string): Promise<void> => {
        try {
            await api.markNotificationAsRead(notificationId);
            setNotifications((prev) =>
                prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
            );
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            Toast.show({
                type: 'error',
                text1: 'Failed to mark as read',
            });
        }
    };

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!isAuthenticated || !user?.id) return;

            try {
                const data = await api.getDashboardNotifications(user.id);
                setNotifications(data);
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
                Toast.show({
                    type: 'error',
                    text1: 'Failed to load notifications',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [isAuthenticated, user?.id]);

    if (!isAuthenticated) {
        return (
            <View className="flex-1 justify-center items-center px-5">
                <Text className="text-xl font-bold text-red-500 mb-2">Unauthorized</Text>
                <Text className="text-base text-gray-500 mb-5 text-center">
                    You must be logged in to view notifications.
                </Text>
                <TouchableOpacity
                    className="bg-blue-500 px-5 py-3 rounded-lg"
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text className="text-white font-bold text-base">Go to Login</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderNotificationItem = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            className={twMerge(
                'bg-white rounded-lg px-4 py-4 mx-4 my-2 shadow',
                !item.isRead && 'bg-blue-50 border-l-4 border-blue-500'
            )}
            onPress={() => handleMarkAsRead(item.id)}
        >
            <View className="flex-row items-center mb-2">
                <Icon name="bell" size={20} color={item.isRead ? '#6b7280' : '#3b82f6'} />
                <Text className="ml-2 text-base font-semibold text-gray-800">{item.title}</Text>
            </View>
            <Text className="text-sm text-gray-600 mb-2">{item.message}</Text>
            <Text className="text-xs text-gray-400">
                {format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm')}
            </Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-100">
            <View className="flex-row items-center p-4 bg-white shadow">
                <Icon name="bell" size={24} color="#3b82f6" />
                <Text className="text-2xl font-bold ml-3 text-gray-800">Notifications</Text>
            </View>

            {notifications.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <Icon name="bell-slash" size={40} color="#9ca3af" />
                    <Text className="text-base text-gray-400 mt-2">You have no notifications</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderNotificationItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingVertical: 16 }}
                />
            )}
        </View>
    );
}
