import React, { useEffect, useState, useRef } from 'react';

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Animated,
} from 'react-native';

import AppHeader from '../../components/common/AppHeader';

import { useNavigation } from '@react-navigation/native';

import {
  subscribeToCustomers,
} from '../../services/customer/customerService';

import {
  subscribeToCollectionsByMonth,
} from '../../services/collection/collectionService';

import {
  saveBillPayment,
  subscribeToBillPayments,
  getPreviousMonthAdvance,
} from '../../services/billing/billingService';

import { Customer } from '../../types/customer';
import { MilkCollection } from '../../types/collection';

export default function BillingScreen() {
  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [collections, setCollections] =
    useState<MilkCollection[]>([]);

  const navigation = useNavigation<any>();
  const [savedPayments, setSavedPayments] =
    useState<{
      [customerId: string]: {
        paidAmount: number;
        remainingAmount: number;
        advanceAmount: number;
        status: 'Paid' | 'Pending';
      };
    }>({});


  const [previousAdvances, setPreviousAdvances] =
    useState<{
      [customerId: string]: {
        advanceAmount: number;
        previousMonth: string;
      };
    }>({});

  const [cashInputs, setCashInputs] =
    useState<{
      [customerId: string]: string;
    }>({});

  const [selectedMonth, setSelectedMonth] =
    useState(new Date());

  const fadeAnim = useRef(
    new Animated.Value(1),
  ).current;

  const slideAnim = useRef(
    new Animated.Value(0),
  ).current;

  const year =
    selectedMonth.getFullYear();

  const month =
    selectedMonth.getMonth();

  const monthString =
    `${year}-${String(month + 1).padStart(2, '0')}`;

  const monthName =
    selectedMonth.toLocaleString(
      'default',
      {
        month: 'long',
        year: 'numeric',
      },
    );

  useEffect(() => {
    const unsubscribeCustomers =
      subscribeToCustomers(data => {
        setCustomers(data);
      });

    return unsubscribeCustomers;
  }, []);


  useEffect(() => {
    const monthStart =
      `${year}-${String(month + 1).padStart(2, '0')}-01`;

    const lastDay =
      new Date(year, month + 1, 0).getDate();

    const monthEnd =
      `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    const unsubscribe =
      subscribeToCollectionsByMonth(
        monthStart,
        monthEnd,
        data => {
          console.log(
            'BILLING DATA:',
            data,
          );

          setCollections(data);
        },
      );

    console.log(
      'CUSTOMERS:',
      customers,
    );

    console.log(
      'COLLECTIONS:',
      collections,
    );
    return unsubscribe;
  }, [year, month]);

  useEffect(() => {
    setCollections([]);
  }, [year, month]);

  useEffect(() => {
    const unsubscribe =
      subscribeToBillPayments(
        monthString,
        bills => {
          const paymentData: {
            [customerId: string]: {
              paidAmount: number;
              remainingAmount: number;
              advanceAmount: number;
              status: 'Paid' | 'Pending';
            };
          } = {};

          bills.forEach(bill => {
            paymentData[
              bill.customerId
            ] = {
              paidAmount:
                Number(
                  bill.paidAmount || 0,
                ),

              remainingAmount:
                Number(
                  bill.remainingAmount || 0,
                ),

              advanceAmount:
                Number(
                  bill.advanceAmount || 0,
                ),

              status: bill.status,
            };
          });

          setSavedPayments(
            paymentData,
          );
        },
      );

    return unsubscribe;
  }, [monthString]);
  useEffect(() => {
    const loadPreviousAdvances = async () => {
      const advanceData: {
        [customerId: string]: {
          advanceAmount: number;
          previousMonth: string;
        };
      } = {};

      for (const customer of customers) {
        if (!customer.id) {
          continue;
        }

        const result =
          await getPreviousMonthAdvance(
            customer.id,
            monthString,
          );

        advanceData[customer.id] = {
          advanceAmount:
            result.advanceAmount,
          previousMonth:
            result.previousMonth,
        };
      }

      setPreviousAdvances(
        advanceData,
      );
    };

    if (customers.length > 0) {
      loadPreviousAdvances();
    }
  }, [customers, monthString]);

  const changeMonth = (
    direction: 'previous' | 'next',
  ) => {

    // Start slightly off-screen
    slideAnim.setValue(
      direction === 'next' ? 30 : -30,
    );

    fadeAnim.setValue(0);

    // Change month
    setSelectedMonth(
      new Date(
        year,
        direction === 'next'
          ? month + 1
          : month - 1,
        1,
      ),
    );

    // Animate new data into view
    Animated.parallel([
      Animated.timing(
        fadeAnim,
        {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        },
      ),

      Animated.timing(
        slideAnim,
        {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        },
      ),
    ]).start();
  };

  const previousMonth = () => {
    changeMonth('previous');
  };

  const nextMonth = () => {
    changeMonth('next');
  };

  const getMorningQuantity = (
    customerId: string,
  ) => {
    return collections
      .filter(
        item =>
          item.customerId === customerId &&
          item.session === 'Morning',
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
    return collections
      .filter(
        item =>
          item.customerId === customerId &&
          item.session === 'Evening',
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
  const getBillAmount = (
    customer: Customer,
  ) => {
    return collections
      .filter(
        item =>
          item.customerId === customer.id!,
      )
      .reduce(
        (total, item) =>
          total +
          Number(item.amount || 0),
        0,
      );
  };
  const getPreviousAdvanceAmount = (
    customerId: string,
  ) => {
    return (
      previousAdvances[
        customerId
      ]?.advanceAmount || 0
    );
  };

  const getPaidAmount = (
    customerId: string,
  ) => {
    return (
      savedPayments[
        customerId
      ]?.paidAmount || 0
    );
  };

  const getAdvanceAmount = (
    customerId: string,
  ) => {
    return (
      savedPayments[
        customerId
      ]?.advanceAmount || 0
    );
  };
  const getNetPayableAmount = (
    customer: Customer,
  ) => {
    const bill =
      getBillAmount(customer);

    const paid =
      getPaidAmount(customer.id!);

    const previousAdvance =
      getPreviousAdvanceAmount(customer.id!);

    return (
      bill -
      previousAdvance -
      paid
    );
  };
  const updatePayment = async (
    customer: Customer,
  ) => {
    const newPayment = Number(
      cashInputs[customer.id!] || 0,
    );
    const billAmount =
      getBillAmount(customer);

    const previousAdvance =
      getPreviousAdvanceAmount(
        customer.id!,
      );

    const total =
      Math.max(
        billAmount - previousAdvance,
        0,
      );

    const alreadyPaid =
      getPaidAmount(customer.id!);

    if (newPayment <= 0) {
      Alert.alert(
        'Invalid Amount',
        'Enter a valid payment amount.',
      );
      return;
    }

    const newTotalPaid =
      alreadyPaid + newPayment;

    const advanceAmount =
      Math.max(
        newTotalPaid - total,
        0,
      );

    // NORMAL PAYMENT
    if (advanceAmount === 0) {
      try {
        await saveBillPayment(
          customer.id!,
          monthString,
          total,
          newTotalPaid,
        );

        setCashInputs(prev => ({
          ...prev,
          [customer.id!]: '',
        }));

        Alert.alert(
          'Success',
          `₹${newPayment.toFixed(2)} payment added.`,
        );

      } catch (error) {
        console.log(error);

        Alert.alert(
          'Error',
          'Failed to update payment.',
        );
      }

      return;
    }

    // EXTRA PAYMENT
    Alert.alert(
      'Extra Payment',
      `Remaining bill: ₹${Math.max(
        total - alreadyPaid,
        0,
      ).toFixed(2)}

Payment received: ₹${newPayment.toFixed(2)}

Extra amount: ₹${advanceAmount.toFixed(2)}

Are you sure you want to add the extra amount?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes, Add',
          onPress: async () => {
            try {
              await saveBillPayment(
                customer.id!,
                monthString,
                total,
                newTotalPaid,
              );

              setCashInputs(prev => ({
                ...prev,
                [customer.id!]: '',
              }));

              Alert.alert(
                'Success',
                `Payment added successfully.\nExtra ₹${advanceAmount.toFixed(
                  2,
                )} saved as advance.`,
              );

            } catch (error) {
              console.log(error);

              Alert.alert(
                'Error',
                'Failed to update payment.',
              );
            }
          },
        },
      ],
    );
  };
  return (
    <SafeAreaView
      style={styles.container}>

      <AppHeader title="Billing" />

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }>

        <Text style={styles.pageTitle}>
          Monthly Billing
        </Text>
        {/* MONTH SELECTOR */}

        <View
          style={styles.monthSelector}>

          <TouchableOpacity
            style={styles.monthButton}
            onPress={previousMonth}>

            <Text
              style={
                styles.monthButtonText
              }>
              ◀
            </Text>

          </TouchableOpacity>

          <Text
            style={styles.monthText}>
            {monthName}
          </Text>

          <TouchableOpacity
            style={styles.monthButton}
            onPress={nextMonth}>

            <Text
              style={
                styles.monthButtonText
              }>
              ▶
            </Text>

          </TouchableOpacity>

        </View>

        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [
              {
                translateX: slideAnim,
              },
            ],
          }}>


          {/* TABLE HEADER */}

          <View
            style={styles.tableHeader}>

            <View
              style={styles.nameColumn}>
              <Text
                style={styles.headerText}>
                Customer
              </Text>
            </View>

            <View
              style={styles.smallColumn}>
              <Text
                style={styles.headerText}>
                Morning
              </Text>
            </View>

            <View
              style={styles.smallColumn}>
              <Text
                style={styles.headerText}>
                Evening
              </Text>
            </View>

            <View
              style={styles.smallColumn}>
              <Text
                style={styles.headerText}>
                Total
              </Text>
            </View>

          </View>
          {/* CUSTOMER TOTALS */}

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

          {/* GAP BETWEEN TABLE AND PAYMENT CARDS */}

          <View style={styles.paymentGap} />
          {customers.map(customer => {
            const total =
              getTotalQuantity(
                customer.id!,
              );

            const bill =
              getBillAmount(customer);

            const paid =
              getPaidAmount(
                customer.id!,
              );

            const previousAdvance =
              previousAdvances[
                customer.id!
              ]?.advanceAmount || 0;

            const previousAdvanceMonth =
              previousAdvances[
                customer.id!
              ]?.previousMonth || '';
            const netAmount =
              getNetPayableAmount(customer);

            const remaining =
              Math.max(netAmount, 0);

            const newAdvance =
              Math.abs(
                Math.min(netAmount, 0),
              );

            const isPaid =
              bill > 0 &&
              remaining <= 0;

            return (
              <View
                key={`payment-${customer.id}`}
                style={styles.billingCard}>

                <View
                  style={styles.billingHeader}>

                  <View style={styles.billingCustomer}>

                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('CustomerPayment', {
                          customerId: customer.id!,
                          monthString,
                        })
                      }>

                      <Text style={styles.billingName}>
                        #{customer.collectionOrder}{' '}
                        {customer.name}
                      </Text>

                    </TouchableOpacity>

                    <Text style={styles.rateText}>
                      ₹{customer.rate}/L
                    </Text>

                  </View>

                  <View>
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

                <View
                  style={styles.amountRow}>

                  {previousAdvance > 0 && (
                    <View style={styles.previousAdvanceBox}>
                      <Text style={styles.previousAdvanceLabel}>
                        Previous Advance
                      </Text>

                      <Text style={styles.previousAdvanceAmount}>
                        ₹{previousAdvance.toFixed(2)}
                      </Text>

                      <Text style={styles.previousAdvanceMonth}>
                        From {previousAdvanceMonth}
                      </Text>
                    </View>
                  )}

                  <View>
                    <Text
                      style={styles.label}>
                      Milk
                    </Text>

                    <Text
                      style={styles.value}>
                      {total.toFixed(2)} L
                    </Text>
                  </View>

                  <View>
                    <Text
                      style={styles.label}>
                      Bill
                    </Text>

                    <Text
                      style={styles.billValue}>
                      ₹{bill.toFixed(2)}
                    </Text>
                  </View>

                  <View>
                    <Text
                      style={styles.label}>
                      Paid
                    </Text>

                    <Text
                      style={styles.paidValue}>
                      ₹{paid.toFixed(2)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.label}>
                      {remaining < 0
                        ? 'Advance'
                        : 'Remaining'}
                    </Text>

                    <Text
                      style={[
                        remaining < 0
                          ? styles.advanceValue
                          : styles.remainingValue,
                      ]}>
                      ₹{Math.abs(remaining).toFixed(2)}
                    </Text>
                  </View>
                </View>

                <Text
                  style={styles.cashLabel}>
                  Cash Collector / Paid
                </Text>

                <View
                  style={styles.paymentRow}>

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
                      setCashInputs(
                        prev => ({
                          ...prev,
                          [customer.id!]:
                            text,
                        }),
                      )
                    }
                  />

                  <TouchableOpacity
                    style={
                      styles.updateButton
                    }
                    onPress={() =>
                      updatePayment(
                        customer,
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

        </Animated.View>

      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  previousMonthText: {
    fontSize: 10,
    color: '#777',
    marginTop: 2,
  },

  advanceValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
  },

  paymentGap: {
    height: 25,
  },

  content: {
    padding: 14,
    paddingBottom: 30,
  },

  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: 12,
  },

  monthSelector: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    elevation: 2,
  },

  monthButton: {
    backgroundColor: '#1976D2',
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  monthButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },

  monthText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
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

  previousAdvanceBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
    alignItems: 'center',
  },

  previousAdvanceLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2E7D32',
  },

  previousAdvanceAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B5E20',
    marginTop: 3,
  },

  previousAdvanceMonth: {
    fontSize: 12,
    color: '#555',
    marginTop: 3,
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
    marginTop: 30,
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
    fontSize: 11,
    color: '#777',
    marginBottom: 4,
  },

  value: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },

  billValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1976D2',
  },

  paidValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
  },

  remainingValue: {
    fontSize: 14,
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
});