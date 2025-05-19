// components/CustomSidebar.tsx

import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useAuth } from '../contexts/AuthContext';

const CustomSidebar: React.FC<DrawerContentComponentProps> = (props) => {
    const navigation = useNavigation<any>();
    const { isAuthenticated } = useAuth();

    // Determine target for "Home" button
    const homeTarget = isAuthenticated ? 'Dashboard' : 'Home';

    return (
        <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: 50 }}>
            {/* Conditional Home link: goes to Dashboard if logged in, else Home */}
            <TouchableOpacity
                style={{ padding: 15, flexDirection: 'row', alignItems: 'center' }}
                onPress={() => navigation.navigate(homeTarget)}
            >
                <FontAwesome5 name="home" size={20} color="#2563eb" style={{ marginRight: 10 }} />
                <Text style={{ fontSize: 18 }}>Home</Text>
            </TouchableOpacity>

            {isAuthenticated && (
                <>
                    <TouchableOpacity style={{ padding: 15, flexDirection: 'row', alignItems: 'center' }} onPress={() => navigation.navigate('CreateAccount')}>
                        <FontAwesome5 name="plus-circle" size={20} color="#2563eb" style={{ marginRight: 10 }} />
                        <Text style={{ fontSize: 18 }}>Create Account</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{ padding: 15, flexDirection: 'row', alignItems: 'center' }} onPress={() => navigation.navigate('Account')}>
                        <FontAwesome5 name="user-cog" size={20} color="#2563eb" style={{ marginRight: 10 }} />
                        <Text style={{ fontSize: 18 }}>Account</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{ padding: 15, flexDirection: 'row', alignItems: 'center' }} onPress={() => navigation.navigate('Transfer')}>
                        <MaterialCommunityIcons name="bank-transfer" size={22} color="#2563eb" style={{ marginRight: 10 }} />
                        <Text style={{ fontSize: 18 }}>Transfer</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{ padding: 15, flexDirection: 'row', alignItems: 'center' }} onPress={() => navigation.navigate('Transactions')}>
                        <FontAwesome5 name="list-alt" size={20} color="#2563eb" style={{ marginRight: 10 }} />
                        <Text style={{ fontSize: 18 }}>Transactions</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{ padding: 15, flexDirection: 'row', alignItems: 'center' }} onPress={() => navigation.navigate('BillPayment')}>
                        <MaterialCommunityIcons name="file-document-outline" size={22} color="#2563eb" style={{ marginRight: 10 }} />
                        <Text style={{ fontSize: 18 }}>Bill Payment</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{ padding: 15, flexDirection: 'row', alignItems: 'center' }} onPress={() => navigation.navigate('PaymentHistory')}>
                        <FontAwesome5 name="receipt" size={20} color="#2563eb" style={{ marginRight: 10 }} />
                        <Text style={{ fontSize: 18 }}>Payment History</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{ padding: 15, flexDirection: 'row', alignItems: 'center' }} onPress={() => navigation.navigate('CreateCreditCard')}>
                        <FontAwesome5 name="plus-circle" size={20} color="#2563eb" style={{ marginRight: 10 }} />
                        <Text style={{ fontSize: 18 }}>Create Credit Card</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{ padding: 15, flexDirection: 'row', alignItems: 'center' }} onPress={() => navigation.navigate('CreditCards')}>
                        <FontAwesome5 name="credit-card" size={20} color="#2563eb" style={{ marginRight: 10 }} />
                        <Text style={{ fontSize: 18 }}>Credit Cards</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{ padding: 15, flexDirection: 'row', alignItems: 'center' }} onPress={() => navigation.navigate('DigitalWallet')}>
                        <FontAwesome5 name="wallet" size={20} color="#2563eb" style={{ marginRight: 10 }} />
                        <Text style={{ fontSize: 18 }}>Wallet</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{ padding: 15, flexDirection: 'row', alignItems: 'center' }} onPress={() => navigation.navigate('DiscountCoupons')}>
                        <FontAwesome5 name="tags" size={20} color="#2563eb" style={{ marginRight: 10 }} />
                        <Text style={{ fontSize: 18 }}>Discount Coupons</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{ padding: 15, flexDirection: 'row', alignItems: 'center' }} onPress={() => navigation.navigate('Security')}>
                        <Feather name="lock" size={20} color="#2563eb" style={{ marginRight: 10 }} />
                        <Text style={{ fontSize: 18 }}>Security</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
};

export default CustomSidebar;
