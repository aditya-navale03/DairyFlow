import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import AppHeader from '../../components/common/AppHeader';

import {subscribeToCustomers} from '../../services/customer/customerService';

import {
  subscribeToCollectionsByDate,
} from '../../services/collection/collectionService';

import {Customer} from '../../types/customer';
import {MilkCollection} from '../../types/collection';

export default function BillingScreen() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [collections, setCollections] = useState<MilkCollection[]>([]);

  useEffect(() => {
    const unsubscribeCustomers =
      subscribeToCustomers(data => {
        setCustomers(data);
      });

    const today = new Date()
      .toISOString()
      .split('T')[0];

    let morning: MilkCollection[] = [];
    let evening: MilkCollection[] = [];

    const updateCollections = () => {
      setCollections([
        ...morning,
        ...evening,
      ]);
    };

    const unsubscribeMorning =
      subscribeToCollectionsByDate(
        today,
        'Morning',
        data => {
          morning = data;
          updateCollections();
        },
      );

    const unsubscribeEvening =
      subscribeToCollectionsByDate(
        today,
        'Evening',
        data => {
          evening = data;
          updateCollections();
        },
      );

    return () => {
      unsubscribeCustomers();
      unsubscribeMorning();
      unsubscribeEvening();
    };
  }, []);

  const totalMilk = collections.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0,
  );

  const totalAmount = collections.reduce(
    (total, item) =>
      total + Number(item.amount || 0),
    0,
  );

  const collectedCustomers = new Set(
    collections.map(item => item.customerId),
  ).size;

  const pendingCustomers = Math.max(
    customers.length - collectedCustomers,
    0,
  );

  return (
    <SafeAreaView style={styles.container}>

      <AppHeader title="Billing" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        <Text style={styles.title}>
          Today's Billing
        </Text>

        <View style={styles.summaryRow}>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {collectedCustomers}
            </Text>

            <Text style={styles.summaryLabel}>
              Collected
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {pendingCustomers}
            </Text>

            <Text style={styles.summaryLabel}>
              Pending
            </Text>
          </View>

        </View>

        <View style={styles.summaryRow}>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {totalMilk.toFixed(2)} L
            </Text>

            <Text style={styles.summaryLabel}>
              Total Milk
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              ₹{totalAmount.toFixed(2)}
            </Text>

            <Text style={styles.summaryLabel}>
              Total Amount
            </Text>
          </View>

        </View>

        <Text style={styles.sectionTitle}>
          Customer Billing
        </Text>

        {customers.map(customer => {

          const customerCollections =
            collections.filter(
              item =>
                item.customerId ===
                customer.id,
            );

          const customerMilk =
            customerCollections.reduce(
              (total, item) =>
                total +
                Number(item.quantity || 0),
              0,
            );

          const customerAmount =
            customerCollections.reduce(
              (total, item) =>
                total +
                Number(item.amount || 0),
              0,
            );

          const hasCollection =
            customerCollections.length > 0;

          return (
            <View
              key={customer.id}
              style={styles.customerCard}>

              <View style={styles.customerTop}>

                <View>
                  <Text style={styles.customerName}>
                    #{customer.collectionOrder}{' '}
                    {customer.name}
                  </Text>

                  <Text style={styles.customerVillage}>
                    {customer.village}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.status,
                    hasCollection
                      ? styles.collected
                      : styles.pending,
                  ]}>
                  {hasCollection
                    ? 'Collected'
                    : 'Pending'}
                </Text>

              </View>

              <View style={styles.divider} />

              <View style={styles.customerBottom}>

                <View>
                  <Text style={styles.smallLabel}>
                    Milk
                  </Text>

                  <Text style={styles.customerValue}>
                    {customerMilk.toFixed(2)} L
                  </Text>
                </View>

                <View>
                  <Text style={styles.smallLabel}>
                    Rate
                  </Text>

                  <Text style={styles.customerValue}>
                    ₹{customer.rate}/L
                  </Text>
                </View>

                <View>
                  <Text style={styles.smallLabel}>
                    Amount
                  </Text>

                  <Text style={styles.amountValue}>
                    ₹{customerAmount.toFixed(2)}
                  </Text>
                </View>

              </View>

            </View>
          );
        })}

      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  content: {
    padding: 16,
    paddingBottom: 30,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: 12,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    margin: 5,
    alignItems: 'center',
    elevation: 3,
  },

  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1976D2',
  },

  summaryLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 5,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginTop: 20,
    marginBottom: 10,
  },

  customerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },

  customerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  customerName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
  },

  customerVillage: {
    fontSize: 13,
    color: '#777',
    marginTop: 4,
  },

  status: {
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },

  collected: {
    color: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },

  pending: {
    color: '#C62828',
    backgroundColor: '#FFEBEE',
  },

  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },

  customerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  smallLabel: {
    fontSize: 12,
    color: '#777',
    marginBottom: 3,
  },

  customerValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },

  amountValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
  },
});