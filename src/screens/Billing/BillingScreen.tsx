import {
  generatePaymentReceipt,
} from '../../services/billing/paymentReceiptService';

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
  ActivityIndicator,

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
  savePaymentHistory,
  getCustomerPaymentHistory,
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
        cashPaid: number;
        remainingAmount: number;
        advanceAmount: number;
        status: 'Paid' | 'Pending';
      };
    }>({});

  const [updatingCustomer, setUpdatingCustomer] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [customersLoaded, setCustomersLoaded] =
    useState(false);

  const [collectionsLoaded, setCollectionsLoaded] =
    useState(false);

  const [paymentsLoaded, setPaymentsLoaded] =
    useState(false);

  const [advancesLoaded, setAdvancesLoaded] =
    useState(false);


  const [loadingAdvances, setLoadingAdvances] =
    useState(false);

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
        setCustomersLoaded(true);
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
          setCollectionsLoaded(true);
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
              cashPaid: number;
              remainingAmount: number;
              advanceAmount: number;
              status: 'Paid' | 'Pending';
            };
          } = {};
          bills.forEach(bill => {
            paymentData[bill.customerId] = {
              paidAmount:
                Number(
                  bill.paidAmount || 0,
                ),

              cashPaid:
                Number(
                  bill.cashPaid || 0,
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
          setSavedPayments(paymentData);
          setPaymentsLoaded(true);
        },
      );

    return unsubscribe;
  }, [monthString]);
  useEffect(() => {
    const loadPreviousAdvances = async () => {
      setLoadingAdvances(true)
      const advanceData: {
        [customerId: string]: {
          advanceAmount: number;
          previousMonth: string;
        };
      } = {};
      await Promise.all(
        customers.map(async customer => {
          if (!customer.id) return;

          const result =
            await getPreviousMonthAdvance(
              customer.id,
              monthString,
            );

          advanceData[customer.id] = {
            advanceAmount: result.advanceAmount,
            previousMonth: result.previousMonth,
          };
        }),
      );
      setPreviousAdvances(advanceData);
      setAdvancesLoaded(true);

    };
    setPreviousAdvances({});

    if (customers.length > 0) {
      loadPreviousAdvances();
    } else {
      setIsLoading(false);
    }
  }, [customers, monthString]);


  useEffect(() => {
    if (
      customersLoaded &&
      collectionsLoaded &&
      paymentsLoaded &&
      advancesLoaded
    ) {
      setIsLoading(false);
    }
  }, [
    customersLoaded,
    collectionsLoaded,
    paymentsLoaded,
    advancesLoaded,
  ]);

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
      ]?.cashPaid || 0
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
  const updatePayment = async (
    customer: Customer,
  ) => {

    setUpdatingCustomer(customer.id!);

    const newPayment = Number(cashInputs[customer.id!] || 0,
    );

    const billAmount =
      getBillAmount(customer);

    const previousAdvance =
      getPreviousAdvanceAmount(
        customer.id!,
      );

    const savedCashPaid =
      getPaidAmount(
        customer.id!,
      );

    if (newPayment <= 0) {
      setUpdatingCustomer(null);

      Alert.alert(
        'Invalid Amount',
        'Enter a valid payment amount.',
      );
      return;
    }
    // Previous advance pays the bill first
    const previousAdvanceUsed =
      Math.min(
        previousAdvance,
        billAmount,
      );

    // Bill remaining after previous advance
    const billAfterAdvance =
      Math.max(
        billAmount -
        previousAdvanceUsed,
        0,
      );

    // Cash already used for this month's bill
    const cashAlreadyUsed =
      Math.min(
        savedCashPaid,
        billAfterAdvance,
      );

    // Cash still needed for the bill
    const cashRemaining =
      Math.max(
        billAfterAdvance -
        cashAlreadyUsed,
        0,
      );

    // New cash actually used for the bill
    const paymentUsed =
      Math.min(
        newPayment,
        cashRemaining,
      );

    // Extra new cash becomes advance
    const extraCash =
      Math.max(
        newPayment -
        cashRemaining,
        0,
      );

    // Unused previous advance carries forward
    const unusedPreviousAdvance =
      Math.max(
        previousAdvance -
        billAmount,
        0,
      );

    // Total advance for next month
    const newAdvance =
      unusedPreviousAdvance +
      extraCash;

    const totalCashPaid =
      savedCashPaid + paymentUsed;


    try {


      await savePaymentHistory(
        customer.id!,
        monthString,
        paymentUsed,
        previousAdvanceUsed,
      );


      const savedBill = await saveBillPayment(
        customer.id!,
        monthString,
        billAmount,
        previousAdvanceUsed,
        totalCashPaid,
        newAdvance,
      );

      await generatePaymentReceipt(
        customer.name,
        customer.mobile,
        savedBill.billAmount,
        savedBill.previousAdvanceUsed,
        paymentUsed,
        savedBill.remainingAmount,
        savedBill.advanceAmount,
        savedBill.paidAmount,
      );

      setCashInputs(prev => ({
        ...prev,
        [customer.id!]: '',
      }));
      setUpdatingCustomer(null);
      Alert.alert(
        'Success',
        `₹${paymentUsed.toFixed(2)} paid.` +
        (newAdvance > 0
          ? `\n₹${newAdvance.toFixed(2)} saved as advance.`
          : ''),
      );
    } catch (error) {
      console.log(error);

      Alert.alert(
        'Error',
        'Failed to update payment.',
      );
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#1976D2"
          />

          <Text style={styles.loadingText}>
            Loading billing...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
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
            const cashPaid =
              getPaidAmount(
                customer.id!,
              );

            const previousAdvance =
              previousAdvances[
                customer.id!
              ]?.advanceAmount || 0;

            const previousAdvanceUsed =
              Math.min(
                previousAdvance,
                bill,
              );
            const billAfterAdvance =
              Math.max(
                bill - previousAdvanceUsed,
                0,
              );

            const cashUsedForBill =
              Math.min(
                cashPaid,
                billAfterAdvance,
              );

            const remaining =
              Math.max(
                billAfterAdvance - cashPaid,
                0,
              );

            const unusedPreviousAdvance =
              Math.max(
                previousAdvance - bill,
                0,
              );

            const extraCash =
              Math.max(
                cashPaid - billAfterAdvance,
                0,
              );

            const newAdvance =
              unusedPreviousAdvance + extraCash;

            const totalPaid =
              previousAdvanceUsed + cashUsedForBill;

            const advanceRemaining =
              newAdvance;
            const isPaid =
              bill > 0 &&
              remaining === 0;

            return (
              <View
                key={`payment-${customer.id}`}
                style={styles.billingCard}>

                <View style={styles.billingHeader}>

                  <View style={styles.billingCustomer}>

                    <View style={styles.nameAdvanceRow}>
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate('CustomerPayment', {
                            customerId: customer.id!,
                            customerName: customer.name,
                            monthString,
                          })
                        }>
                        <Text
                          style={styles.billingName}
                          numberOfLines={1}>
                          #{customer.collectionOrder} {customer.name}
                        </Text>
                      </TouchableOpacity>

                      {advanceRemaining > 0 && (
                        <View style={styles.previousAdvanceBox}>
                          <Text style={styles.previousAdvanceLabel}>
                            Advance
                          </Text>

                          <Text style={styles.previousAdvanceAmount}>
                            ₹{advanceRemaining.toFixed(2)}
                          </Text>
                        </View>
                      )}

                    </View>

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
                    {isPaid ? 'PAID' : 'PENDING'}
                  </Text>

                </View>

                <View
                  style={styles.amountRow}>

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
                      ₹{totalPaid.toFixed(2)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.label}>
                      {newAdvance > 0
                        ? 'Advance'
                        : 'Remaining'}
                    </Text>

                    <Text
                      style={[
                        remaining < 0
                          ? styles.advanceValue
                          : styles.remainingValue,
                      ]}>
                      ₹{(newAdvance > 0 ? newAdvance : remaining).toFixed(2)}                    </Text>
                  </View>
                </View>

                <Text
                  style={styles.cashLabel}>
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
                    onPress={() => updatePayment(customer)}
                    disabled={updatingCustomer === customer.id}
                  >
                    {updatingCustomer === customer.id ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.updateButtonText}>
                        UPDATE
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.receiptButton}
                  onPress={() =>
                    navigation.navigate('CustomerReceipt', {
                      customerId: customer.id!,
                      customerName: customer.name,
                      customerMobile: customer.mobile,
                      monthString,
                    })
                  }>

                  <Text style={styles.receiptButtonText}>
                    VIEW RECEIPT
                  </Text>

                </TouchableOpacity>
              </View>
            );
          })}

        </Animated.View>

      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 15,
    color: '#555',
  },

  nameAdvanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rateText: {
    fontSize: 13,
    color: '#777',
    marginTop: 3,
  },

  billingCustomer: {
    flex: 1,
    marginRight: 8,
  },




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
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 0,
    marginLeft: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  previousAdvanceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C62828',
    textAlign: 'center',
  },

  previousAdvanceAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C62828',
    marginTop: 1,
  },

  previousAdvanceMonth: {
    fontSize: 8,
    color: '#666',
    marginTop: 1,
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


  billingName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
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
    alignItems: 'center',
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

  receiptButton: {
    marginTop: 10,
    backgroundColor: '#EAF3FF',
    borderWidth: 1,
    borderColor: '#1976D2',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },

  receiptButtonText: {
    color: '#1976D2',
    fontSize: 13,
    fontWeight: '700',
  },
});