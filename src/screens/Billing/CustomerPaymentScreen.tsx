import React, { useEffect, useState } from 'react';

import {
  SafeAreaView,
  Text,
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import AppHeader from '../../components/common/AppHeader';

import {
  getCustomerPaymentHistory,
} from '../../services/billing/billingService';

export default function CustomerPaymentScreen({
  route,
}: any) {
  const {
    customerId,
    customerName,
    monthString,
  } = route.params;

  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const data =
          await getCustomerPaymentHistory(
            customerId,
            monthString,
          );
        const sortedPayments = data.sort((a: any, b: any) => {
          const dateA = a.createdAt?.toDate
            ? a.createdAt.toDate()
            : new Date(a.createdAt);

          const dateB = b.createdAt?.toDate
            ? b.createdAt.toDate()
            : new Date(b.createdAt);

          return dateB.getTime() - dateA.getTime();
        });

        setPayments(sortedPayments);
      } catch (error) {
        console.log('Payment history error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, [customerId, monthString]);
  const cashPaid = payments.reduce(
    (total, item) =>
      total + Number(item.amount || 0),
    0,
  );

  const advanceUsed = payments.reduce(
    (total, item) =>
      total +
      Number(item.previousAdvanceUsed || 0),
    0,
  );

  const totalPaid =
    cashPaid + advanceUsed;

  const formatAmount = (amount: number) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };


  const formatPaymentDate = (createdAt: any) => {
    if (!createdAt) {
      return 'Date not available';
    }

    const date = createdAt?.toDate
      ? createdAt.toDate()
      : new Date(createdAt);

    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title={customerName}
        subtitle="Payment History"
      />

      {loading ? (
        <View style={styles.center}>
          <View style={styles.loaderCard}>
            <ActivityIndicator
              size="large"
              color="#1976D2"
            />

            <Text style={styles.loadingText}>
              Loading payment history...
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              {/* Summary Card */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryTop}>
                  <View>
                    <Text style={styles.summaryLabel}>
                      TOTAL CASH PAID
                    </Text>
                    <Text style={styles.totalAmount}>
                      {formatAmount(totalPaid)}
                    </Text>
                  </View>

                  <View style={styles.paymentIcon}>
                    <Text style={styles.paymentIconText}>
                      ₹
                    </Text>
                  </View>
                </View>

                <View style={styles.summaryDivider} />

                <View style={styles.summaryBottom}>
                  <View>
                    <Text style={styles.smallLabel}>
                      Payments
                    </Text>

                    <Text style={styles.smallValue}>
                      {payments.length}
                    </Text>
                  </View>

                  <View style={styles.statusContainer}>
                    <View style={styles.statusDot} />

                    <Text style={styles.statusText}>
                      Payment Record
                    </Text>
                  </View>
                </View>
              </View>

              {/* Section Header */}
              {payments.length > 0 && (
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>
                      Payment Activity
                    </Text>

                    <Text style={styles.sectionSubtitle}>
                      Recent payments from this customer
                    </Text>
                  </View>
                </View>
              )}
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Text style={styles.emptyIconText}>
                  ₹
                </Text>
              </View>

              <Text style={styles.emptyTitle}>
                No payments yet
              </Text>

              <Text style={styles.emptySubtitle}>
                Payment records for {customerName} will appear here.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.paymentCard}>
              <View style={styles.paymentIconSmall}>
                <Text style={styles.paymentIconSmallText}>
                  ₹
                </Text>
              </View>

              <View style={styles.paymentInfo}>
                <Text style={styles.paymentTitle}>
                  Cash Payment
                </Text>

                <Text style={styles.paymentDate}>
                  {formatPaymentDate(item.createdAt)}
                </Text>

                {Number(item.previousAdvanceUsed || 0) > 0 && (
                  <Text style={styles.advanceUsedText}>
                    Previous Advance Used: ₹
                    {Number(item.previousAdvanceUsed).toFixed(2)}
                  </Text>
                )}
              </View>

              <View style={styles.amountContainer}>
                <Text style={styles.paymentAmount}>
                  {formatAmount(item.amount)}
                </Text>

                <View style={styles.paidBadge}>
                  <Text style={styles.paidText}>
                    PAID
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },

  advanceUsedText: {
    fontSize: 11,
    color: '#1976D2',
    marginTop: 4,
    fontWeight: '600',
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 30,
  },

  /* ---------------- SUMMARY ---------------- */

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,

    elevation: 4,
  },

  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A94A6',
    letterSpacing: 1.2,
    marginBottom: 7,
  },

  totalAmount: {
    fontSize: 30,
    fontWeight: '800',
    color: '#172033',
    letterSpacing: -0.5,
  },

  paymentIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: '#EAF3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  paymentIconText: {
    fontSize: 25,
    fontWeight: '800',
    color: '#1976D2',
  },

  summaryDivider: {
    height: 1,
    backgroundColor: '#EEF1F5',
    marginVertical: 18,
  },

  summaryBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  smallLabel: {
    fontSize: 12,
    color: '#8A94A6',
    marginBottom: 3,
  },

  smallValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#172033',
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FAF4',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22A06B',
    marginRight: 6,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#198754',
  },

  /* ---------------- SECTION ---------------- */

  sectionHeader: {
    marginTop: 26,
    marginBottom: 13,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#172033',
  },

  sectionSubtitle: {
    fontSize: 12,
    color: '#8A94A6',
    marginTop: 4,
  },

  /* ---------------- PAYMENT CARD ---------------- */

  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 15,
    marginBottom: 11,

    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.055,
    shadowRadius: 8,

    elevation: 2,
  },

  paymentIconSmall: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#EAF3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  paymentIconSmallText: {
    fontSize: 21,
    fontWeight: '800',
    color: '#1976D2',
  },

  paymentInfo: {
    flex: 1,
    marginLeft: 13,
  },

  paymentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#172033',
  },

  paymentDate: {
    fontSize: 12,
    color: '#8A94A6',
    marginTop: 5,
  },

  amountContainer: {
    alignItems: 'flex-end',
  },

  paymentAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#172033',
  },

  paidBadge: {
    marginTop: 5,
    backgroundColor: '#EAF8F0',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },

  paidText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#198754',
    letterSpacing: 0.5,
  },

  /* ---------------- EMPTY ---------------- */

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 25,
    paddingVertical: 38,
    alignItems: 'center',
    marginTop: 5,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,

    elevation: 2,
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: '#EAF3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  emptyIconText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1976D2',
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#172033',
  },

  emptySubtitle: {
    fontSize: 13,
    color: '#8A94A6',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 7,
  },

  /* ---------------- LOADING ---------------- */

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loaderCard: {
    alignItems: 'center',
    padding: 25,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#7B8494',
  },
});
