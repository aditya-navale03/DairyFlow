import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  subscribeToCustomers,
} from '../../services/customer/customerService';

import {
  subscribeToBillPayments,
} from '../../services/billing/billingService';

import AppHeader from '../../components/common/AppHeader';
import SummaryCard from '../../components/dashboard/SummaryCard';

import {
  subscribeToCollectionsByDate,
  subscribeToCollectionsByMonth,
  deleteCollection,
} from '../../services/collection/collectionService';


import { MilkCollection } from '../../types/collection';
import { Customer } from '../../types/customer';

export default function DashboardScreen() {
  const [customerCount, setCustomerCount] = useState(0);

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [totalMilk, setTotalMilk] = useState(0);

  const [revenue, setRevenue] = useState(0);
  const [pendingBills, setPendingBills] = useState(0);

  const [monthlyCollections, setMonthlyCollections] =
    useState<MilkCollection[]>([]);

  const [monthlyBills, setMonthlyBills] =
    useState<any[]>([]);


  const [morningCount, setMorningCount] =
    useState(0);


  const [eveningCount, setEveningCount] =
    useState(0);

  const [todayCollections, setTodayCollections] =
    useState<MilkCollection[]>([]);
  useEffect(() => {
    const today = new Date();

    const year = today.getFullYear();
    const month = today.getMonth();

    const monthStart =
      `${year}-${String(month + 1).padStart(2, '0')}-01`;

    const lastDay =
      new Date(
        year,
        month + 1,
        0,
      ).getDate();

    const monthEnd =
      `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const monthString =
      `${year}-${String(month + 1).padStart(2, '0')}`;

    const unsubscribeCollections =
      subscribeToCollectionsByMonth(
        monthStart,
        monthEnd,
        collections => {
          setMonthlyCollections(collections);
        },
      );

    const unsubscribeBills =
      subscribeToBillPayments(
        monthString,
        bills => {
          setMonthlyBills(bills);
        },
      );

    return () => {
      unsubscribeCollections();
      unsubscribeBills();
    };
  }, []);
  /*
   * CUSTOMERS - REAL TIME
   */
  useEffect(() => {
    const unsubscribe =
      subscribeToCustomers(customers => {
        setCustomers(customers);
        setCustomerCount(customers.length);
      });

    return unsubscribe;
  }, []);

  /*
   * TODAY'S COLLECTIONS - REAL TIME
   */
  useEffect(() => {
    const today = new Date()
      .toISOString()
      .split('T')[0];

    let morningData: MilkCollection[] = [];
    let eveningData: MilkCollection[] = [];

    const updateCollections = () => {
      const allCollections = [
        ...morningData,
        ...eveningData,
      ];

      setTodayCollections(allCollections);

      const milk = allCollections.reduce(
        (total, item) =>
          total + Number(item.quantity || 0),
        0,
      );

      const money = allCollections.reduce(
        (total, item) =>
          total + Number(item.amount || 0),
        0,
      );

      setTotalMilk(milk);
      setRevenue(money);
    };

    const unsubscribeMorning =
      subscribeToCollectionsByDate(
        today,
        'Morning',
        collections => {
          morningData = collections;

          setMorningCount(
            collections.length,
          );

          updateCollections();
        },
      );

    const unsubscribeEvening =
      subscribeToCollectionsByDate(
        today,
        'Evening',
        collections => {
          eveningData = collections;

          setEveningCount(
            collections.length,
          );

          updateCollections();
        },
      );

    return () => {
      unsubscribeMorning();
      unsubscribeEvening();
    };
  }, []);

  const calculatedPendingBills =
    customers.filter(customer => {
      // Get this customer's collections
      const customerCollections =
        monthlyCollections.filter(
          item =>
            item.customerId === customer.id,
        );

      // No collection = no bill
      if (customerCollections.length === 0) {
        return false;
      }

      // Calculate monthly milk
      const totalMilk =
        customerCollections.reduce(
          (total, item) =>
            total +
            Number(item.quantity || 0),
          0,
        );

      // Calculate monthly bill
      const bill =
        totalMilk *
        Number(customer.rate || 0);

      // Find saved payment
      const savedBill =
        monthlyBills.find(
          item =>
            item.customerId === customer.id,
        );

      // If no payment exists, paid = 0
      const paid =
        Number(
          savedBill?.paidAmount || 0,
        );

      // Bill exists and isn't fully paid
      return bill > 0 && paid < bill;
    }).length;

  const remainingMorning =
    Math.max(
      customerCount - morningCount,
      0,
    );

  const remainingEvening =
    Math.max(
      customerCount - eveningCount,
      0,
    );
  const handleDeleteCollection = (
    item: MilkCollection,
  ) => {
    const collectionId = item.id;

    if (!collectionId) {
      return;
    }

    Alert.alert(
      'Delete Collection',
      `Are you sure you want to delete ${item.customerName}'s ${item.session} collection of ${Number(
        item.quantity,
      ).toFixed(2)} L?`,
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
              await deleteCollection(collectionId);

            } catch (error) {
              console.log(error);

              Alert.alert(
                'Error',
                'Failed to delete collection',
              );
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>

      <AppHeader title="Dashboard" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* TODAY'S SUMMARY */}

        <Text style={styles.sectionTitle}>
          Today's Summary
        </Text>

        <View style={styles.row}>

          <SummaryCard
            title="Customers"
            value={customerCount}
          />

          <SummaryCard
            title="Today's Milk"
            value={`${totalMilk.toFixed(2)} L`}
          />

        </View>

        <View style={styles.row}>

          <SummaryCard
            title="Revenue"
            value={`₹${revenue.toFixed(2)}`}
          />

          <SummaryCard
            title="Pending Bills"
            value={calculatedPendingBills} />

        </View>

        {/* COLLECTION STATUS */}

        <Text style={styles.sectionTitle}>
          Collection Status
        </Text>

        <View style={styles.statusCard}>

          <View style={styles.statusRow}>

            <View>
              <Text style={styles.statusTitle}>
                🌅 Morning
              </Text>

              <Text style={styles.statusSubtext}>
                {morningCount} / {customerCount} customers
              </Text>
            </View>

            <Text style={styles.statusCount}>
              {remainingMorning}
            </Text>

          </View>

          <View style={styles.divider} />

          <View style={styles.statusRow}>

            <View>
              <Text style={styles.statusTitle}>
                🌙 Evening
              </Text>

              <Text style={styles.statusSubtext}>
                {eveningCount} / {customerCount} customers
              </Text>
            </View>

            <Text style={styles.statusCount}>
              {remainingEvening}
            </Text>

          </View>

        </View>

        {/* TODAY'S COLLECTION */}

        <Text style={styles.sectionTitle}>
          Today's Collection
        </Text>

        {todayCollections.length === 0 ? (

          <View style={styles.emptyCard}>

            <Text style={styles.emptyText}>
              No collection recorded today
            </Text>

          </View>

        ) : (

          todayCollections.map(
            (item, index) => (

              <View
                key={
                  item.id ||
                  `${item.customerId}-${index}`
                }
                style={styles.collectionCard}>

                <View
                  style={
                    styles.collectionLeft
                  }>

                  <Text
                    style={
                      styles.collectionName
                    }>
                    #{item.collectionOrder}{' '}
                    {item.customerName}
                  </Text>

                  <Text
                    style={
                      styles.collectionSession
                    }>
                    {item.session}
                  </Text>

                </View>
                <View style={styles.collectionRight}>

                  <View style={styles.collectionValues}>

                    <View style={styles.amountContainer}>
                      <Text style={styles.collectionQuantity}>
                        {Number(item.quantity).toFixed(2)} L
                      </Text>

                      <Text style={styles.collectionAmount}>
                        ₹{Number(item.amount).toFixed(2)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteCollection(item)}>

                      <Text style={styles.deleteButtonText}>
                        Remove  
                      </Text>

                    </TouchableOpacity>

                  </View>

                </View>
              </View>

            ),
          )

        )}

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  collectionValues: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  amountContainer: {
    alignItems: 'flex-end',
  },

  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  content: {
    padding: 16,
    paddingBottom: 30,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 16,
    color: '#222',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    elevation: 3,
  },

  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },

  statusSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },

  statusCount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1976D2',
  },

  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 15,
  },

  collectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  collectionLeft: {
    flex: 1,
    paddingRight: 10,
  },

  collectionName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },

  collectionSession: {
    fontSize: 13,
    color: '#777',
    marginTop: 4,
  },

  collectionRight: {
    alignItems: 'flex-end',
    marginRight: 15,
  },

  collectionQuantity: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1976D2',
  },

  collectionAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2E7D32',
    marginTop: 4,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },

  emptyText: {
    color: '#777',
    fontSize: 15,
  },

  deleteButton: {
  marginLeft: 20,
  backgroundColor: '#D32F2F',
  paddingHorizontal: 12,
  paddingVertical: 9,
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
},

deleteButtonText: {
  color: '#FFFFFF',
  fontSize: 13,
  fontWeight: '700',
},
});