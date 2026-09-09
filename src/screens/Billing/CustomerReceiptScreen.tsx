import React, {useState} from 'react';

import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';

import {
  getCustomerCollectionsByDateRange,
} from '../../services/collection/collectionService';

import DateTimePicker from '@react-native-community/datetimepicker';

import AppHeader from '../../components/common/AppHeader';

export default function CustomerReceiptScreen({
  route,
}: any) {
  const {
    customerId,
    customerName,
    monthString,
  } = route.params;

  const [startDate, setStartDate] =
    useState(new Date());

  const [endDate, setEndDate] =
    useState(new Date());

  const [showStartPicker, setShowStartPicker] =
    useState(false);

  const [showEndPicker, setShowEndPicker] =
    useState(false);

  const [receiptData, setReceiptData] =
    useState<any[]>([]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const generateReceipt = async () => {
    const startDateString =
      startDate.toISOString().split('T')[0];

    const endDateString =
      endDate.toISOString().split('T')[0];

    if (startDateString > endDateString) {
      console.log('Invalid date range');
      return;
    }

    try {
      const data =
        await getCustomerCollectionsByDateRange(
          customerId,
          startDateString,
          endDateString,
        );

      setReceiptData(data);

      console.log(
        'RECEIPT DATA:',
        data,
      );
    } catch (error) {
      console.log(
        'Receipt collection error:',
        error,
      );
    }
  };

  const totalMilk = receiptData.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0,
  );

  const totalAmount = receiptData.reduce(
    (total, item) =>
      total + Number(item.amount || 0),
    0,
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="Milk Receipt"
        subtitle="Select Date Range"
      />

      <ScrollView
        contentContainerStyle={styles.content}>

        <Text style={styles.title}>
          Receipt Date Range
        </Text>

        {/* Start Date */}

        <Text style={styles.label}>
          Start Date
        </Text>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() =>
            setShowStartPicker(true)
          }>
          <Text style={styles.dateText}>
            {formatDate(startDate)}
          </Text>
        </TouchableOpacity>

        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display={
              Platform.OS === 'ios'
                ? 'spinner'
                : 'default'
            }
            onChange={(event, date) => {
              setShowStartPicker(false);

              if (date) {
                setStartDate(date);
              }
            }}
          />
        )}

        {/* End Date */}

        <Text style={styles.label}>
          End Date
        </Text>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() =>
            setShowEndPicker(true)
          }>
          <Text style={styles.dateText}>
            {formatDate(endDate)}
          </Text>
        </TouchableOpacity>

        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display={
              Platform.OS === 'ios'
                ? 'spinner'
                : 'default'
            }
            onChange={(event, date) => {
              setShowEndPicker(false);

              if (date) {
                setEndDate(date);
              }
            }}
          />
        )}

        {/* Generate */}

        <TouchableOpacity
          style={styles.generateButton}
          onPress={generateReceipt}>

          <Text style={styles.generateButtonText}>
            GENERATE RECEIPT
          </Text>

        </TouchableOpacity>

        {/* Receipt Data */}

        {receiptData.length > 0 && (
          <View style={styles.resultBox}>

            <Text style={styles.resultTitle}>
              {customerName}
            </Text>

            <Text style={styles.dateRange}>
              {formatDate(startDate)} →{' '}
              {formatDate(endDate)}
            </Text>

            {/* Header */}

            <View style={styles.collectionRow}>
              <Text style={styles.headerText}>
                Date
              </Text>

              <Text style={styles.headerText}>
                Session
              </Text>

              <Text style={styles.headerText}>
                Qty
              </Text>

              <Text style={styles.headerText}>
                Amount
              </Text>
            </View>

            {/* Collections */}

            {receiptData.map(item => (
              <View
                key={item.id}
                style={styles.collectionRow}>

                <Text style={styles.resultText}>
                  {item.dateString}
                </Text>

                <Text style={styles.resultText}>
                  {item.session}
                </Text>

                <Text style={styles.resultText}>
                  {item.quantity} L
                </Text>

                <Text style={styles.resultText}>
                  ₹{item.amount}
                </Text>

              </View>
            ))}

            {/* Totals */}

            <View style={styles.totalRow}>
              <Text style={styles.totalText}>
                Total Milk
              </Text>

              <Text style={styles.totalText}>
                {totalMilk} L
              </Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalText}>
                Total Amount
              </Text>

              <Text style={styles.totalText}>
                ₹{totalAmount}
              </Text>
            </View>

          </View>
        )}

        {receiptData.length === 0 && (
          <Text style={styles.noData}>
            No collection data found.
          </Text>
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
    padding: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 25,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },

  dateButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D0D7DE',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 15,
    marginBottom: 20,
  },

  dateText: {
    fontSize: 16,
    color: '#222',
  },

  generateButton: {
    marginTop: 10,
    backgroundColor: '#1976D2',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },

  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  resultBox: {
    marginTop: 25,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
  },

  resultTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },

  dateRange: {
    marginTop: 5,
    marginBottom: 15,
    color: '#666',
  },

  collectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingVertical: 10,
  },

  headerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#222',
  },

  resultText: {
    fontSize: 12,
    color: '#444',
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  totalText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },

  noData: {
    marginTop: 25,
    textAlign: 'center',
    color: '#777',
  },
});