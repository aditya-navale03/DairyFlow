
import React, { useEffect, useState } from 'react';
import { FlatList } from 'react-native';


import { deleteCustomerAndReorder } from '../../services/customer/customerOrderService';

import CustomerCard from '../../components/customer/CustomerCard';

import { Customer } from '../../types/customer';
import { getCustomers } from '../../services/customer/customerService';


import { Alert } from 'react-native';

import {
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../navigation/CustomerNavigator';

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
  const [search, setSearch] = useState('');
  useFocusEffect(
    React.useCallback(() => {
      loadCustomers();
    }, []),
  );

  const loadCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.log(error);
    }
  };
  const navigation = useNavigation<NavigationProp>();

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(search.toLowerCase()) ||
    customer.mobile.includes(search),
  );

  const handleDelete = (customer: Customer) => {
    Alert.alert(
      'Delete Customer',
      `Are you sure you want to delete ${customer.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (customer.id) {
                await deleteCustomerAndReorder(customer); 
                loadCustomers();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete customer');
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Customers</Text>
      <TextInput
        placeholder="Search customer..."
        style={styles.search}
        value={search}
        onChangeText={setSearch}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddCustomer', {
          customer: undefined,
        })}>
        <Text style={styles.addButtonText}>
          + Add Customer
        </Text>
      </TouchableOpacity>
      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id ?? Math.random().toString()}
        renderItem={({ item }) => (
          <CustomerCard
            customer={item}
            onCollect={() => {
              console.log('Collect milk for', item.name);
            }}
            onEdit={() =>
              navigation.navigate('AddCustomer', {
                customer: item,
              })
            }
            onDelete={() => handleDelete(item)}
          />
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