import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import CustomerScreen from '../screens/Customers/CustomerScreen';
import AddCustomerScreen from '../screens/Customers/AddCustomerScreen';

export type CustomerStackParamList = {
  CustomerList: undefined;
  AddCustomer: undefined;
};

const Stack = createNativeStackNavigator<CustomerStackParamList>();

export default function CustomerNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="CustomerList"
        component={CustomerScreen}
      />

      <Stack.Screen
        name="AddCustomer"
        component={AddCustomerScreen}
      />
    </Stack.Navigator>
  );
}