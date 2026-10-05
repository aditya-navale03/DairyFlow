
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import AppTextInput from '../common/AppTextInput';
import {
  getNextAvailableCollectionOrder,
} from '../../services/customer/customerService';

type Props = {
  name: string;
  mobile: string;
  rate: string;
  collectionOrder: string;

  setName: (value: string) => void;
  setMobile: (value: string) => void;
  setRate: (value: string) => void;
  setCollectionOrder: (value: string) => void;

  buttonTitle: string;
  onSubmit: () => void;
};

export default function CustomerForm({
  name,
  mobile,
  rate,
  collectionOrder,
  setName,
  setMobile,
  setRate,
  setCollectionOrder,
  buttonTitle,
  onSubmit,
}: Props) {
  return (
    <View>
      <AppTextInput
        placeholder="Customer Name"
        value={name}
        onChangeText={setName}
      />

      <AppTextInput
        placeholder="Mobile Number"
        value={mobile}
        keyboardType="phone-pad"
        onChangeText={setMobile}
      />

      <AppTextInput
        placeholder="Rate per Litre"
        value={rate}
        keyboardType="numeric"
        onChangeText={setRate}
      />
      <View style={styles.collectionRow}>
        <View style={styles.collectionInput}>
          <AppTextInput
            placeholder="Collection Number"
            keyboardType="numeric"
            value={collectionOrder}
            onChangeText={setCollectionOrder}
          />
        </View>
        <TouchableOpacity
          style={styles.nextNumberButton}
          onPress={async () => {
            const nextNumber =
              await getNextAvailableCollectionOrder();

            setCollectionOrder(
              String(nextNumber),
            );
          }}>
          <Text style={styles.nextNumberText}>
            NEXT
          </Text>
        </TouchableOpacity>
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
  button: {
    backgroundColor: '#1976D2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  //collection number auto
  collectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  nextNumberButton: {
    backgroundColor: '#1976D2',
    width: 45,
    height: 45,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
nextNumberText: {
  color: '#fff',
  fontSize: 12,
  fontWeight: '700',
},

  collectionInput: {
    flex: 1,
  },
});