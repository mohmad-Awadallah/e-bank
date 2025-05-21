// screens/SecurityLogsScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { api, SecurityLog } from '../services/apiService';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { format } from 'date-fns';

export default function SecurityLogsScreen() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<SecurityLog[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLogs = async () => {
            if (!user) return;

            try {
                const data = await api.getUserSecurityLogs(Number(user.id), currentPage);
                setLogs(data.content || []);
                setTotalPages(data.totalPages);
            } catch (error) {
                console.error('Failed to load security logs:', error);
            } finally {
                setLoading(false);
            }
        };

        loadLogs();
    }, [user, currentPage]);

    const renderLogItem = ({ item }: { item: SecurityLog }) => (
        <View className="bg-white rounded-lg p-4 mx-4 my-2 shadow-sm">
            <View className="flex-row items-center mb-3">
                <Icon name="shield-halved" size={20} color="#3b82f6" />
                <Text className="ml-2 text-sm text-gray-600">{format(new Date(item.timestamp), 'dd/MM/yyyy HH:mm')}</Text>
            </View>

            <View className="flex-row items-center my-1">
                <Icon name="network-wired" size={16} color="#6b7280" />
                <Text className="ml-2 text-sm text-gray-700">{item.ipAddress}</Text>
            </View>

            <View className="flex-row items-center my-1">
                <Icon name="desktop" size={16} color="#6b7280" />
                <Text className="ml-2 text-sm text-gray-700">{item.deviceInfo}</Text>
            </View>

            <View className="flex-row items-center my-1">
                <Icon name="user-shield" size={16} color="#6b7280" />
                <Text className="ml-2 text-sm text-gray-700">{item.action}</Text>
            </View>

            <View
                className={`flex-row items-center self-start mt-2 px-2 py-1 rounded-full ${item.status === 'SUCCESS' ? 'bg-green-100' : 'bg-red-100'
                    }`}
            >
                <Icon
                    name={item.status === 'SUCCESS' ? 'check-circle' : 'times-circle'}
                    size={16}
                    color={item.status === 'SUCCESS' ? '#22c55e' : '#ef4444'}
                />
                <Text className="ml-1 text-sm font-medium">{item.status}</Text>
            </View>
        </View>
    );

    const PaginationControls = () => (
        <View className="flex-row justify-between items-center p-4 bg-white shadow">
            <TouchableOpacity
                className={`flex-row items-center px-2 py-2 rounded-md ${currentPage === 0 ? 'opacity-50' : 'bg-blue-50'}`}
                onPress={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
            >
                <Icon name="chevron-left" size={16} color="#3b82f6" />
                <Text className="text-blue-500 font-medium mx-1">Previous</Text>
            </TouchableOpacity>

            <Text className="text-gray-700 font-medium">
                Page {currentPage + 1} of {totalPages}
            </Text>

            <TouchableOpacity
                className={`flex-row items-center px-2 py-2 rounded-md ${currentPage + 1 >= totalPages ? 'opacity-50' : 'bg-blue-50'
                    }`}
                onPress={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage + 1 >= totalPages}
            >
                <Text className="text-blue-500 font-medium mx-1">Next</Text>
                <Icon name="chevron-right" size={16} color="#3b82f6" />
            </TouchableOpacity>
        </View>
    );

    if (!user || loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-100">
            <View className="flex-row items-center p-4 bg-white shadow">
                <Icon name="shield-halved" size={28} color="#3b82f6" />
                <Text className="text-2xl font-bold text-gray-800 ml-3">Security Logs</Text>
            </View>

            {logs.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <Icon name="file-circle-xmark" size={40} color="#6b7280" />
                    <Text className="text-base text-gray-500 mt-2">No security logs found</Text>
                </View>
            ) : (
                <FlatList
                    data={logs}
                    renderItem={renderLogItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 16 }}
                    ListFooterComponent={<PaginationControls />}
                />
            )}
        </View>
    );
}
