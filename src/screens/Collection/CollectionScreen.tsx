import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';

import AppTextInput from '../../components/common/AppTextInput';
import {Customer} from '../../types/customer';
import {getCustomers} from '../../services/customer/customerService';

export default function CollectionScreen() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [quantity, setQuantity] = useState('');
  const [fat, setFat] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    const data = await getCustomers();
    setCustomers(data);
  };

  const customer = customers[currentIndex];

  if (!customer) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>No customers found.</Text>
      </SafeAreaView>
    );
  }

  const amount =
    (Number(quantity) || 0) * customer.rate;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>
        Morning Collection
      </Text>

      <Text style={styles.counter}>
        Customer {currentIndex + 1} / {customers.length}
      </Text>

      <View style={styles.card}>
        <Text style={styles.name}>
          {customer.collectionOrder}. {customer.name}
        </Text>

        <Text style={styles.info}>
          Village: {customer.village}
        </Text>

        <Text style={styles.info}>
          Rate: ₹{customer.rate}/L
        </Text>

        <AppTextInput
          placeholder="Milk Quantity (L)"
          keyboardType="numeric"
          value={quantity}
          onChangeText={setQuantity}
        />

        <AppTextInput
          placeholder="Fat"
          keyboardType="numeric"
          value={fat}
          onChangeText={setFat}
        />

        <Text style={styles.amount}>
          Amount: ₹{amount.toFixed(2)}
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setQuantity('');
            setFat('');

            if (currentIndex < customers.length - 1) {
              setCurrentIndex(currentIndex + 1);
            }
          }}>
          <Text style={styles.buttonText}>
            SAVE & NEXT
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 20,
  },

  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: 20,
  },

  counter: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: '600',
  },

  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    elevation: 3,
  },

  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
  },

  info: {
    fontSize: 18,
    marginBottom: 8,
  },

  amount: {
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 15,
  },

  button: {
    backgroundColor: '#1976D2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});