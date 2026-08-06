import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import AppTextInput from '../common/AppTextInput';

type Props = {
  name: string;
  mobile: string;
  village: string;
  rate: string;
  collectionOrder: string;

  setName: (value: string) => void;
  setMobile: (value: string) => void;
  setVillage: (value: string) => void;
  setRate: (value: string) => void;
  setCollectionOrder: (value: string) => void;

  buttonTitle: string;
  onSubmit: () => void;
};

export default function CustomerForm({
  name,
  mobile,
  village,
  rate,
  collectionOrder,
  setName,
  setMobile,
  setVillage,
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
        placeholder="Village"
        value={village}
        onChangeText={setVillage}
      />

      <AppTextInput
        placeholder="Rate per Litre"
        value={rate}
        keyboardType="numeric"
        onChangeText={setRate}
      />

      <AppTextInput
  placeholder="Collection Number"
  keyboardType="numeric"
  value={collectionOrder}
  onChangeText={setCollectionOrder}
/>

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
});