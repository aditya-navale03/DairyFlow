
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
      <View style={styles.searchContainer}>

        <Text style={styles.searchLabel}>
          Search Customer
        </Text>

        <TextInput
          style={styles.search}
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name or mobile"
          placeholderTextColor="#888"
        />

      </View>

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


            onStatement={() =>
              navigation.navigate(
                'CustomerStatement',
                {
                  customer: item,
                },
              )
            }

            onEdit={() =>
              navigation.navigate(
                'AddCustomer',
                {
                  customer: item,
                },
              )
            }

            onDelete={() =>
              handleDelete(item)
            }
          />
        )}
      />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  statementButton: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: -5,
    marginBottom: 12,
  },

  statementButtonText: {
    color: '#1976D2',
    fontSize: 14,
    fontWeight: '700',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 16,
    paddingTop: 35,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    color: '#1976D2',
  },
searchContainer: {
  position: 'relative',
  marginTop: 5,
  marginBottom: 20,
},

searchLabel: {
  position: 'absolute',
  top: -10,
  left: 14,
  backgroundColor: '#F5F7FA',
  paddingHorizontal: 6,
  zIndex: 1,
  fontSize: 13,
  color: '#1976D2',
  fontWeight: '600',
},

search: {
  backgroundColor: '#fff',
  borderRadius: 12,
  paddingHorizontal: 15,
  paddingVertical: 14,
  borderWidth: 1,
  borderColor: '#1976D2',
  fontSize: 16,
  color: '#000',
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