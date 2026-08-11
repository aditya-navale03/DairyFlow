import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


import CustomerScreen from '../screens/Customers/CustomerScreen';
import AddCustomerScreen from '../screens/Customers/AddCustomerScreen';
import CustomerStatementScreen from '../screens/Customers/CustomerStatementScreen';

import { Customer } from '../types/customer';

export type CustomerStackParamList = {
  CustomerList: undefined;

  AddCustomer: {
    customer?: Customer;
  };

  CustomerStatement: {
    customer: Customer;
  };
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

      <Stack.Screen
        name="CustomerStatement"
        component={CustomerStatementScreen}
      />
    </Stack.Navigator>
  );
}