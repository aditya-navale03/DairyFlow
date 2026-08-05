import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import AppTextInput from '../common/AppTextInput';
import SessionSelector from './SessionSelector';

type Props = {
  customerName: string;

  quantity: string;
  fat: string;
  session: 'Morning' | 'Evening';

  setQuantity: (value: string) => void;
  setFat: (value: string) => void;
  setSession: (value: 'Morning' | 'Evening') => void;

  rate: number;
  amount: number;

  buttonTitle: string;
  onSubmit: () => void;
};

export default function CollectionForm({
  customerName,
  quantity,
  fat,
  session,
  setQuantity,
  setFat,
  setSession,
  rate,
  amount,
  buttonTitle,
  onSubmit,
}: Props) {
  return (
    <View>

      <Text style={styles.label}>Customer</Text>

      <View style={styles.readOnly}>
        <Text>{customerName}</Text>
      </View>

      <Text style={styles.label}>Session</Text>

      <SessionSelector
        value={session}
        onChange={setSession}
      />

      <AppTextInput
        placeholder="Milk Quantity (L)"
        keyboardType="numeric"
        value={quantity}
        onChangeText={setQuantity}
      />

      <AppTextInput
        placeholder="FAT"
        keyboardType="numeric"
        value={fat}
        onChangeText={setFat}
      />

      <View style={styles.summary}>
        <Text>Rate : ₹{rate}/L</Text>

        <Text style={styles.amount}>
          Amount : ₹{amount.toFixed(2)}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={onSubmit}>
        <Text style={styles.buttonText}>
          {buttonTitle}
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 10,
  },

  readOnly: {
    backgroundColor: '#EFEFEF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },

  summary: {
    marginTop: 20,
    marginBottom: 20,
  },

  amount: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '700',
    color: '#1976D2',
  },

  button: {
    backgroundColor: '#1976D2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});