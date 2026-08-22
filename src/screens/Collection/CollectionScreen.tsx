import {
  addMilkCollection,
  getCustomerCollection,
} from '../../services/collection/collectionService';

import React, { useEffect, useState } from 'react';

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';

import AppTextInput from '../../components/common/AppTextInput';
import { Customer } from '../../types/customer';
import {subscribeToCustomers} from '../../services/customer/customerService';
export default function CollectionScreen() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [quantity, setQuantity] = useState('');

  const [session, setSession] =
    useState<'Morning' | 'Evening'>('Morning');

      useEffect(() => {
    const unsubscribe = subscribeToCustomers(data => {
      setCustomers(data);
    });

    return unsubscribe;
  }, []);

  const customer = customers[currentIndex];

  if (!customer) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>No customers found.</Text>
      </SafeAreaView>
    );
  }

  const amount =
    (Number(quantity) || 0) * (customer.rate || 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}>

        <Text style={styles.title}>
          Milk Collection
        </Text>

        <Text style={styles.counter}>
          Customer {currentIndex + 1} / {customers.length}
        </Text>

        {/* PREVIOUS / NEXT */}
        <View style={styles.navigation}>
          <TouchableOpacity
            style={styles.navButton}
            disabled={currentIndex === 0}
            onPress={() => {
              if (currentIndex > 0) {
                setCurrentIndex(currentIndex - 1);
                setQuantity('');
              }
            }}>
            <Text style={styles.navButtonText}>
              ◀ Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            disabled={
              currentIndex === customers.length - 1
            }
            onPress={() => {
              if (currentIndex < customers.length - 1) {
                setCurrentIndex(currentIndex + 1);
                setQuantity('');
              }
            }}>
            <Text style={styles.navButtonText}>
              Next ▶
            </Text>
          </TouchableOpacity>
        </View>

        {/* CUSTOMER */}
        <View style={styles.customerCard}>
          <Text style={styles.customerNumber}>
            #{customer.collectionOrder}
          </Text>

          <Text style={styles.name}>
            {customer.name}
          </Text>

          <Text style={styles.rate}>
            ₹{customer.rate}/L
          </Text>
        </View>

        {/* MORNING / EVENING */}
        <View style={styles.sessionCard}>
          <Text style={styles.inputLabel}>
            Collection Session
          </Text>

          <View style={styles.sessionOptions}>

            <TouchableOpacity
              style={[
                styles.sessionButton,
                session === 'Morning' &&
                styles.sessionButtonSelected,
              ]}
              onPress={() => setSession('Morning')}>

              <Text
                style={[
                  styles.sessionButtonText,
                  session === 'Morning' &&
                  styles.sessionButtonTextSelected,
                ]}>
                Morning
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sessionButton,
                session === 'Evening' &&
                styles.sessionButtonSelected,
              ]}
              onPress={() => setSession('Evening')}>

              <Text
                style={[
                  styles.sessionButtonText,
                  session === 'Evening' &&
                  styles.sessionButtonTextSelected,
                ]}>
                Evening
              </Text>

            </TouchableOpacity>

          </View>
        </View>

        {/* MILK QUANTITY */}
        <View style={styles.inputCard}>

          <Text style={styles.inputLabel}>
            Milk Quantity (L)
          </Text>

          {/* QUICK QUANTITY BUTTONS */}
          <View style={styles.quantityOptions}>

            <TouchableOpacity
              style={[
                styles.quantityButton,
                quantity === '0.25' &&
                styles.quantityButtonSelected,
              ]}
              onPress={() => setQuantity('0.25')}>

              <Text
                style={[
                  styles.quantityButtonText,
                  quantity === '0.25' &&
                  styles.quantityButtonTextSelected,
                ]}>
                0.25 L
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quantityButton,
                quantity === '0.5' &&
                styles.quantityButtonSelected,
              ]}
              onPress={() => setQuantity('0.5')}>

              <Text
                style={[
                  styles.quantityButtonText,
                  quantity === '0.5' &&
                  styles.quantityButtonTextSelected,
                ]}>
                0.5 L
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quantityButton,
                quantity === '0.75' &&
                styles.quantityButtonSelected,
              ]}
              onPress={() => setQuantity('0.75')}>

              <Text
                style={[
                  styles.quantityButtonText,
                  quantity === '0.75' &&
                  styles.quantityButtonTextSelected,
                ]}>
                0.75 L
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quantityButton,
                quantity === '1' &&
                styles.quantityButtonSelected,
              ]}
              onPress={() => setQuantity('1')}>

              <Text
                style={[
                  styles.quantityButtonText,
                  quantity === '1' &&
                  styles.quantityButtonTextSelected,
                ]}>
                1 L
              </Text>

            </TouchableOpacity>

          </View>

          {/* CUSTOM / SELECTED QUANTITY BOX */}
          <AppTextInput
            placeholder="Enter quantity"
            keyboardType="decimal-pad"
            value={quantity}
            onChangeText={setQuantity}
            style={styles.bigInput}
          />

        </View>

        {/* TOTAL AMOUNT */}
        <View style={styles.amountCard}>

          <Text style={styles.amountLabel}>
            Total Amount
          </Text>

          <Text style={styles.amountValue}>
            ₹ {amount.toFixed(2)}
          </Text>

        </View>

        {/* SAVE */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={async () => {

            if (!quantity) {
              Alert.alert(
                'Validation',
                'Enter milk quantity',
              );
              return;
            }

            try {
              const today = new Date()
                .toISOString()
                .split('T')[0];

              const existing =
                await getCustomerCollection(
                  customer.id!,
                  today,
                  session,
                );

              if (existing) {
                Alert.alert(
                  'Duplicate',
                  `${session} collection already exists for this customer.`,
                );
                return;
              }

              await addMilkCollection({
                customerId: customer.id!,
                customerName: customer.name,
                collectionOrder:
                  customer.collectionOrder,
                date: new Date(),
                dateString: today,
                session: session,
                quantity: Number(quantity),
                rate: customer.rate,
                amount: amount,
              });

              Alert.alert(
                'Success',
                `${session} collection saved successfully`,
              );

              setQuantity('');

            } catch (error) {
              console.log(error);

              Alert.alert(
                'Error',
                'Failed to save collection',
              );
            }
          }}>

          <Text style={styles.saveButtonText}>
            SAVE
          </Text>

        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 18,
    paddingTop: 70,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: 10,
  },

  counter: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },

  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  navButton: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },

  navButtonText: {
    color: '#fff',
    fontWeight: '700',
  },

  customerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
  },

  customerNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1976D2',
  },

  name: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 6,
  },

  info: {
    fontSize: 15,
    marginTop: 4,
  },

  rate: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2E7D32',
    marginTop: 4,
  },

  /* MORNING / EVENING */

  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },

  sessionOptions: {
    flexDirection: 'row',
    gap: 10,
  },

  sessionButton: {
    flex: 1,
    backgroundColor: '#E3F2FD',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#90CAF9',
  },

  sessionButtonSelected: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },

  sessionButtonText: {
    color: '#1976D2',
    fontSize: 15,
    fontWeight: '700',
  },

  sessionButtonTextSelected: {
    color: '#fff',
  },

  /* QUANTITY */

  inputCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },

  inputLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },

  quantityOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  quantityButton: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#90CAF9',
  },

  quantityButtonSelected: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },

  quantityButtonText: {
    color: '#1976D2',
    fontSize: 14,
    fontWeight: '700',
  },

  quantityButtonTextSelected: {
    color: '#fff',
  },

  bigInput: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },

  /* AMOUNT */

  amountCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
  },

  amountLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },

  amountValue: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1B5E20',
    marginTop: 6,
  },

  /* SAVE */

  saveButton: {
    backgroundColor: '#1976D2',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },

  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

});