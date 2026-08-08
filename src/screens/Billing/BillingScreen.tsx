import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';


import {
  saveBillPayment,
  subscribeToBillPayments,
} from '../../services/billing/billingService';

import AppHeader from '../../components/common/AppHeader';

import {subscribeToCustomers} from '../../services/customer/customerService';

import {
  subscribeToCollectionsByDate,
} from '../../services/collection/collectionService';

import {Customer} from '../../types/customer';
import {MilkCollection} from '../../types/collection';


export default function BillingScreen() {
  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [morningCollections, setMorningCollections] =
    useState<MilkCollection[]>([]);

  const [eveningCollections, setEveningCollections] =
    useState<MilkCollection[]>([]);


  const [cashInputs, setCashInputs] =
    useState<{[customerId: string]: string}>({});


    const [savedPayments, setSavedPayments] =
  useState<{
    [customerId: string]: {
      paidAmount: number;
      remainingAmount: number;
      status: 'Paid' | 'Pending';
    };
  }>({});
  useEffect(() => {
    const unsubscribeCustomers =
      subscribeToCustomers(data => {
        setCustomers(data);
      });

    const today = new Date()
      .toISOString()
      .split('T')[0];

    const unsubscribeMorning =
      subscribeToCollectionsByDate(
        today,
        'Morning',
        data => {
          setMorningCollections(data);
        },
      );

    const unsubscribeEvening =
      subscribeToCollectionsByDate(
        today,
        'Evening',
        data => {
          setEveningCollections(data);
        },
      );

      const unsubscribePayments =
  subscribeToBillPayments(
    today,
    bills => {
      const paymentData: {
        [customerId: string]: {
          paidAmount: number;
          remainingAmount: number;
          status: 'Paid' | 'Pending';
        };
      } = {};

      bills.forEach(bill => {
        paymentData[bill.customerId] = {
          paidAmount: Number(
            bill.paidAmount || 0,
          ),
          remainingAmount: Number(
            bill.remainingAmount || 0,
          ),
          status: bill.status,
        };
      });

      setSavedPayments(paymentData);
    },
  );
  

    return () => {
      unsubscribeCustomers();
      unsubscribeMorning();
      unsubscribeEvening();
      unsubscribePayments();

    };
  }, []);

  const getMorningQuantity = (
    customerId: string,
  ) => {
    return morningCollections
      .filter(
        item =>
          item.customerId === customerId,
      )
      .reduce(
        (total, item) =>
          total +
          Number(item.quantity || 0),
        0,
      );
  };

  const getEveningQuantity = (
    customerId: string,
  ) => {
    return eveningCollections
      .filter(
        item =>
          item.customerId === customerId,
      )
      .reduce(
        (total, item) =>
          total +
          Number(item.quantity || 0),
        0,
      );
  };

  const getTotalQuantity = (
    customerId: string,
  ) => {
    return (
      getMorningQuantity(customerId) +
      getEveningQuantity(customerId)
    );
  };

  const getTotalAmount = (
    customerId: string,
  ) => {
    return getTotalQuantity(customerId) *
      (
        customers.find(
          customer => customer.id === customerId,
        )?.rate || 0
      );
  };

const getPaidAmount = (
  customerId: string,
) => {
  return (
    savedPayments[customerId]?.paidAmount || 0
  );
};
  const getRemainingAmount = (
    customerId: string,
  ) => {
    return Math.max(
      getTotalAmount(customerId) -
        getPaidAmount(customerId),
      0,
    );
  };
const updatePayment = async (
  customerId: string,
) => {
  const amount = Number(
    cashInputs[customerId] || 0,
  );

  const total =
    getTotalAmount(customerId);

  if (amount < 0) {
    Alert.alert(
      'Invalid Amount',
      'Enter a valid amount.',
    );
    return;
  }

  if (amount > total) {
    Alert.alert(
      'Invalid Amount',
      'Paid amount cannot be greater than the bill.',
    );
    return;
  }

  try {
    const today = new Date()
      .toISOString()
      .split('T')[0];

    await saveBillPayment(
      customerId,
      today,
      total,
      amount,
    );

    setCashInputs(prev => ({
      ...prev,
      [customerId]: '',
    }));

    Alert.alert(
      'Success',
      'Payment saved successfully.',
    );

  } catch (error) {
    console.log(error);

    Alert.alert(
      'Error',
      'Could not save payment.',
    );
  }
};
  return (
    <SafeAreaView style={styles.container}>

      <AppHeader title="Billing" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        <Text style={styles.pageTitle}>
          Today's Billing
        </Text>

        {/* TABLE HEADER */}

        <View style={styles.tableHeader}>

          <View style={styles.nameColumn}>
            <Text style={styles.headerText}>
              Customer
            </Text>
          </View>

          <View style={styles.smallColumn}>
            <Text style={styles.headerText}>
              Morning
            </Text>
          </View>

          <View style={styles.smallColumn}>
            <Text style={styles.headerText}>
              Evening
            </Text>
          </View>

          <View style={styles.smallColumn}>
            <Text style={styles.headerText}>
              Total
            </Text>
          </View>

        </View>

        {/* CUSTOMER ROWS */}

        {customers.map(customer => {
          const morning =
            getMorningQuantity(
              customer.id!,
            );

          const evening =
            getEveningQuantity(
              customer.id!,
            );

          const total =
            morning + evening;

          return (
            <View
              key={customer.id}
              style={styles.customerRow}>

              <View style={styles.nameColumn}>
                <Text
                  style={styles.customerName}
                  numberOfLines={1}>
                  #{customer.collectionOrder}{' '}
                  {customer.name}
                </Text>
              </View>

              <View style={styles.smallColumn}>
                <Text style={styles.quantityText}>
                  {morning.toFixed(2)}
                </Text>
              </View>

              <View style={styles.smallColumn}>
                <Text style={styles.quantityText}>
                  {evening.toFixed(2)}
                </Text>
              </View>

              <View style={styles.smallColumn}>
                <Text style={styles.totalQuantity}>
                  {total.toFixed(2)}
                </Text>
              </View>

            </View>
          );
        })}

        {/* BILLING DETAILS */}

        <Text style={styles.sectionTitle}>
          Payment Details
        </Text>

        {customers.map(customer => {
          const total =
            getTotalQuantity(
              customer.id!,
            );

          const bill =
            getTotalAmount(
              customer.id!,
            );

          const paid =
            getPaidAmount(
              customer.id!,
            );

          const remaining =
            getRemainingAmount(
              customer.id!,
            );

          const isPaid =
            bill > 0 &&
            remaining === 0;

          return (
            <View
              key={`payment-${customer.id}`}
              style={styles.billingCard}>

              <View style={styles.billingHeader}>

                <View style={styles.billingCustomer}>
                  <Text style={styles.billingName}>
                    #{customer.collectionOrder}{' '}
                    {customer.name}
                  </Text>

                  <Text style={styles.rateText}>
                    ₹{customer.rate}/L
                  </Text>
                </View>

                <Text
                  style={[
                    styles.status,
                    isPaid
                      ? styles.paid
                      : styles.pending,
                  ]}>
                  {isPaid
                    ? 'PAID'
                    : 'PENDING'}
                </Text>

              </View>

              <View style={styles.amountRow}>

                <View>
                  <Text style={styles.label}>
                    Milk
                  </Text>

                  <Text style={styles.value}>
                    {total.toFixed(2)} L
                  </Text>
                </View>

                <View>
                  <Text style={styles.label}>
                    Bill
                  </Text>

                  <Text style={styles.billValue}>
                    ₹{bill.toFixed(2)}
                  </Text>
                </View>

                <View>
                  <Text style={styles.label}>
                    Remaining
                  </Text>

                  <Text style={styles.remainingValue}>
                    ₹{remaining.toFixed(2)}
                  </Text>
                </View>

              </View>

              {/* CASH COLLECTOR */}

              <Text style={styles.cashLabel}>
                Cash Collector / Paid
              </Text>

              <View style={styles.paymentRow}>

                <TextInput
                  style={styles.cashInput}
                  placeholder="Enter paid amount"
                  placeholderTextColor="#888"
                  keyboardType="decimal-pad"
                  value={
                    cashInputs[
                      customer.id!
                    ] || ''
                  }
                  onChangeText={text =>
                    setCashInputs(prev => ({
                      ...prev,
                      [customer.id!]: text,
                    }))
                  }
                />

                <TouchableOpacity
                  style={styles.updateButton}
                  onPress={() =>
                    updatePayment(
                      customer.id!,
                    )
                  }>

                  <Text
                    style={
                      styles.updateButtonText
                    }>
                    UPDATE
                  </Text>

                </TouchableOpacity>

              </View>

            </View>
          );
        })}

        {customers.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No customers found.
            </Text>
          </View>
        )}

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
    padding: 14,
    paddingBottom: 30,
  },

  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: 14,
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1976D2',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },

  customerRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },

  nameColumn: {
    flex: 2.2,
    paddingRight: 4,
  },

  smallColumn: {
    flex: 1,
    alignItems: 'center',
  },

  headerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },

  customerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#222',
  },

  quantityText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '600',
  },

  totalQuantity: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1976D2',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginTop: 22,
    marginBottom: 10,
  },

  billingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
  },

  billingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  billingCustomer: {
    flex: 1,
  },

  billingName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
  },

  rateText: {
    fontSize: 13,
    color: '#777',
    marginTop: 3,
  },

  status: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '700',
  },

  paid: {
    color: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },

  pending: {
    color: '#C62828',
    backgroundColor: '#FFEBEE',
  },

  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },

  label: {
    fontSize: 12,
    color: '#777',
    marginBottom: 4,
  },

  value: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },

  billValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1976D2',
  },

  remainingValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#C62828',
  },

  cashLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginTop: 15,
    marginBottom: 8,
  },

  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  cashInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#000',
    marginRight: 8,
  },

  updateButton: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },

  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },

  emptyText: {
    color: '#777',
    fontSize: 15,
  },
});