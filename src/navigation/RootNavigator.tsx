import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/Splash/SplashScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';

import CustomerPaymentScreen from '../screens/Billing/CustomerPaymentScreen';
import BottomTabNavigator from './BottomTabNavigation';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Main: undefined;

  CustomerPayment: {
    customerId: string;
    customerName: string;
    monthString: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Main" component={BottomTabNavigator} />
      <Stack.Screen name="CustomerPayment" component={CustomerPaymentScreen} />
    </Stack.Navigator>
  );
}