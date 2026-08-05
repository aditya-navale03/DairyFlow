import React from 'react';
import {StyleSheet, TouchableOpacity, Text, View} from 'react-native';
import AppTextInput from '../../components/common/AppTextInput';

type Props = {
  name: string;
  mobile: string;
  village: string;
  rate: string;

  setName: (value: string) => void;
  setMobile: (value: string) => void;
  setVillage: (value: string) => void;
  setRate: (value: string) => void;

  buttonTitle: string;
  onSubmit: () => void;
};

export default function CustomerForm({
  name,
  mobile,
  village,
  rate,
  setName,
  setMobile,
  setVillage,
  setRate,
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
        keyboardType="phone-pad"
        value={mobile}
        onChangeText={setMobile}
      />

      <AppTextInput
        placeholder="Village"
        value={village}
        onChangeText={setVillage}
      />

      <AppTextInput
        placeholder="Rate per Litre"
        keyboardType="numeric"
        value={rate}
        onChangeText={setRate}
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