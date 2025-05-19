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

import CustomSidebar from './components/CustomSidebar';
import MobileHeader from './components/MobileHeader';

export type RootDrawerParamList = {
  Home: undefined;
  Login: undefined;
  Dashboard: undefined;
  Register: undefined;
  Transactions: undefined;
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
