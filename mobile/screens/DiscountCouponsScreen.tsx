// screens/DiscountCouponsScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { api, DiscountCoupon } from '../services/apiService';
import {
    BadgePercent,
    Calendar,
    Coins,
    Info,
    Maximize2,
    ChevronDown,
    ChevronUp
} from 'lucide-react-native';
import { format } from 'date-fns';

export default function DiscountCouponsScreen() {
    const [coupons, setCoupons] = useState<DiscountCoupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedCode, setExpandedCode] = useState<string | null>(null);

    const loadCoupons = async () => {
        try {
            const data = await api.fetchCoupons();
            setCoupons(data);
        } catch (error) {
            console.error('Failed to load coupons:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCoupons();
    }, []);

    const renderCouponItem = ({ item }: { item: DiscountCoupon }) => {
        const isExpanded = expandedCode === item.couponCode;

        return (
            <TouchableOpacity
                className="bg-white rounded-2xl mx-4 my-2 p-4 shadow"
                activeOpacity={0.9}
                onPress={() => setExpandedCode(isExpanded ? null : item.couponCode)}
            >
                {/* Header */}
                <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center">
                        <BadgePercent size={24} color="#10b981" />
                        <Text className="text-lg font-semibold text-gray-800 ml-3">
                            {item.couponCode}
                        </Text>
                    </View>
                    {isExpanded ? (
                        <ChevronUp size={24} color="#6b7280" />
                    ) : (
                        <ChevronDown size={24} color="#6b7280" />
                    )}
                </View>

                {/* Description */}
                <View className="flex-row items-center mb-3">
                    <Info size={18} color="#6b7280" />
                    <Text className="text-sm text-gray-600 ml-2 flex-1">
                        {item.description}
                    </Text>
                </View>

                {/* Summary */}
                <View className="bg-blue-50 p-3 rounded-lg shadow-inner mb-3">
                    <Text className="text-center font-medium">
                        {item.discountType === 'PERCENTAGE' ? (
                            <Text className="text-blue-600">{item.discountValue}% OFF</Text>
                        ) : (
                            <Text className="text-green-600">Save ${item.discountValue}</Text>
                        )}
                    </Text>
                </View>

                {/* Details */}
                {isExpanded && (
                    <View className="border-t border-gray-200 pt-3 space-y-2">
                        <View className="flex-row items-center">
                            <Coins size={18} color="#eab308" />
                            <Text className="text-sm text-gray-700 ml-2">
                                Type: {item.discountType === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amount'}
                            </Text>
                        </View>

                        <View className="flex-row items-center">
                            <BadgePercent size={18} color="#3b82f6" />
                            <Text className="text-sm text-gray-700 ml-2">
                                Value: {item.discountValue}
                            </Text>
                        </View>

                        <View className="flex-row items-center">
                            <Calendar size={18} color="#8b5cf6" />
                            <Text className="text-sm text-gray-700 ml-2">
                                Expires: {format(new Date(item.expiryDate), 'dd/MM/yyyy')}
                            </Text>
                        </View>

                        <View className="flex-row items-center">
                            <Maximize2 size={18} color="#ef4444" />
                            <Text className="text-sm text-gray-700 ml-2">
                                Usage Limit: {item.usageLimit}
                            </Text>
                        </View>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="flex-row items-center bg-white p-4 shadow">
                <BadgePercent size={28} color="#3b82f6" />
                <Text className="text-2xl font-bold text-gray-800 ml-3">
                    Discount Coupons
                </Text>
            </View>

            {/* Empty State */}
            {coupons.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-gray-600 mt-6">No coupons available</Text>
                </View>
            ) : (
                <FlatList
                    data={coupons}
                    renderItem={renderCouponItem}
                    keyExtractor={(item) => item.couponCode}
                    contentContainerClassName="py-4"
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}