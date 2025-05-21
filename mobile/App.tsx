// App.tsx
import './global.css';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerNavigationOptions } from '@react-navigation/drawer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { AuthProvider, useAuth } from './contexts/AuthContext';

import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import RegisterScreen from './screens/RegisterScreen';
import TransactionsScreen from './screens/TransactionsScreen';
import CreateAccountScreen from './screens/CreateAccountScreen';
import AccountScreen from './screens/AccountScreen';
import TransferScreen from './screens/TransferScreen';
import BillPaymentHistoryScreen from './screens/BillPaymentHistoryScreen';
import BillPaymentScreen from './screens/BillPaymentScreen';
import CreditCardsScreen from './screens/CreditCardsScreen';
import CreditCardDetailsScreen from './screens/CreditCardDetailsScreen';
import CreateCreditCardScreen from './screens/CreateCreditCardScreen';
import DigitalWalletScreen from './screens/DigitalWalletScreen';
import DiscountCouponsScreen from './screens/DiscountCouponsScreen';
import SecurityLogsScreen from './screens/SecurityLogsScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import NotificationsScreen from './screens/NotificationsScreen';


import CustomSidebar from './components/CustomSidebar';
import MobileHeader from './components/MobileHeader';

export type RootDrawerParamList = {
  Home: undefined;
  Login: undefined;
  Dashboard: undefined;
  Register: undefined;
  Transactions: undefined;
  CreateAccount: undefined;
  Account : undefined;
  Transfer: undefined;
  PaymentHistory: undefined;
  BillPayment: undefined;
  CreditCards: undefined;
  CreditCardDetails: { cardId: string }
  CreateCreditCard: undefined;
  DigitalWallet: undefined;
  DiscountCoupons: undefined;
  Security: undefined;
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
};

const Drawer = createDrawerNavigator<RootDrawerParamList>();

const drawerOptions: DrawerNavigationOptions = {
  header: () => <MobileHeader />,
  drawerType: 'front',
  overlayColor: 'transparent',
  drawerStyle: { width: '80%' },
  swipeEnabled: false,
};

const AuthenticatedScreens = () => (
  <>
    <Drawer.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{ title: 'Dashboard' }}
    />
    <Drawer.Screen
      name="Transactions"
      component={TransactionsScreen}
      options={{ title: 'Transactions' }}
    />
    <Drawer.Screen
      name="CreateAccount"
      component={CreateAccountScreen}
      options={{ title: 'Create Account' }}
    />
    <Drawer.Screen
      name="Account"
      component={AccountScreen}
      options={{ title: 'Account' }}
    />
    <Drawer.Screen
      name="Transfer"
      component={TransferScreen}
      options={{ title: 'Transfer' }}
    />
    <Drawer.Screen
      name="PaymentHistory"
      component={BillPaymentHistoryScreen}
      options={{ title: 'Bill Payment History' }}
    />
    <Drawer.Screen
      name="BillPayment"
      component={BillPaymentScreen}
      options={{ title: 'Bill Payment' }}
    />
    <Drawer.Screen
      name="CreditCards"
      component={CreditCardsScreen}
      options={{ title: 'Credit Cards' }}
    />
    <Drawer.Screen
      name="CreditCardDetails"
      component={CreditCardDetailsScreen}
      options={{ title: 'Credit Card Details' }}
    />
    <Drawer.Screen
      name="CreateCreditCard"
      component={CreateCreditCardScreen}
      options={{ title: 'Create Credit Card' }}
    />
    <Drawer.Screen
      name="DigitalWallet"
      component={DigitalWalletScreen}
      options={{ title: 'Digital Wallet' }}
    />
    <Drawer.Screen
      name="DiscountCoupons"
      component={DiscountCouponsScreen}
      options={{ title: 'Discount Coupons' }}
    />
    <Drawer.Screen
      name="Security"
      component={SecurityLogsScreen}
      options={{ title: 'Security Logs' }}
    />
    <Drawer.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
    <Drawer.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ title: 'Settings' }}
    />
    <Drawer.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{ title: 'Notifications' }}
    />
  </>
);

const UnauthenticatedScreens = () => (
  <>
    <Drawer.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
    <Drawer.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
    <Drawer.Screen name="Register" component={RegisterScreen} options={{ title: 'Register' }} />
  </>
);


const AppNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomSidebar {...props} />}
      screenOptions={drawerOptions}
    >
      {isAuthenticated ? AuthenticatedScreens() : UnauthenticatedScreens()}
    </Drawer.Navigator>
  );
};


const App = () => (
  <SafeAreaProvider>
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
        <Toast />
        <StatusBar style="auto" />
      </NavigationContainer>
    </AuthProvider>
  </SafeAreaProvider>
);

export default App;
