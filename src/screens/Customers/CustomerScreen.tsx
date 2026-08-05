
import React, {useEffect, useState} from 'react';
import {FlatList} from 'react-native';


import CustomerCard from '../../components/customer/CustomerCard';

import {Customer} from '../../types/customer';
import {getCustomers} from '../../services/customer/customerService';

import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CustomerStackParamList} from '../../navigation/CustomerNavigator';

type NavigationProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'CustomerList'
>;

import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';



export default function CustomerScreen() {

  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
  loadCustomers();
}, []);

const loadCustomers = async () => {
  try {
    const data = await getCustomers();
    setCustomers(data);
  } catch (error) {
    console.log(error);
  }
};
    const navigation = useNavigation<NavigationProp>();

    
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Customers</Text>

      <TextInput
        placeholder="Search customer..."
        style={styles.search}
      />
<TouchableOpacity
  style={styles.addButton}
  onPress={() => navigation.navigate('AddCustomer')}>
  <Text style={styles.addButtonText}>
    + Add Customer
  </Text>
</TouchableOpacity>
<FlatList
  data={customers}
  keyExtractor={(item) => item.id ?? Math.random().toString()}
  renderItem={({item}) => (
    <CustomerCard customer={item} />
  )}
/>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 16,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    color: '#1976D2',
  },

  search: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  addButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },

  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    color: '#888',
    fontSize: 16,
  },
});