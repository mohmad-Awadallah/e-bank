import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { FontAwesome, Feather } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MobileHeader() {
    const navigation = useNavigation<any>();
    const { user, isAuthenticated, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log Out', style: 'destructive', onPress: logout },
        ]);
    };

    return (
        <SafeAreaView className="bg-white">
            <View className="py-3 px-4 flex-row justify-between items-center shadow-md">
                {/* Left Section - Hamburger + Logo */}
                <TouchableOpacity
                    onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
                    className="flex-row items-center"
                >
                    <FontAwesome name="bars" size={24} color="#2563eb" className="mr-3" />
                    <Text className="text-lg font-bold text-blue-600">E-Bank</Text>
                </TouchableOpacity>

                {/* Right Section */}
                <View className="flex-row items-center">
                    {isAuthenticated ? (
                        <>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Notifications')}
                                className="mx-2 relative"
                            >
                                <Feather name="bell" size={24} color="#1f2937" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => navigation.navigate('Profile')}
                                className="flex-row items-center mx-2"
                            >
                                <FontAwesome name="user" size={16} color="#2563eb" />
                                <Text className="ml-1 text-blue-600 font-semibold">
                                    {user?.firstName} {user?.lastName}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleLogout}
                                className="flex-row items-center mx-2"
                            >
                                <FontAwesome name="sign-out" size={16} color="#dc2626" />
                                <Text className="ml-1 text-red-600 font-semibold">Logout</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Login')}
                                className="flex-row items-center mx-2"
                            >
                                <FontAwesome name="sign-in" size={16} color="#2563eb" />
                                <Text className="ml-1 text-blue-600 font-semibold">Login</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => navigation.navigate('Register')}
                                className="flex-row items-center bg-blue-600 px-3 py-1.5 rounded-full ml-2"
                            >
                                <FontAwesome name="plus-circle" size={16} color="#fff" />
                                <Text className="ml-1 text-white font-semibold">Register</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}
