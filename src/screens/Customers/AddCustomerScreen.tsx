import {addCustomer} from '../../services/customer/customerService';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CustomerStackParamList} from '../../navigation/CustomerNavigator';
type NavigationProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'AddCustomer'
>;

import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

import React, {useState} from 'react';

import AppTextInput from '../../components/common/AppTextInput';
export default function AddCustomerScreen() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [village, setVillage] = useState('');
  const [rate, setRate] = useState('');
const navigation = useNavigation<NavigationProp>();
  const onSave = async () => {
  if (!name || !mobile || !village || !rate) {
    Alert.alert('Validation', 'Please fill all fields');
    return;
  }

  try {
    await addCustomer({
      name,
      mobile,
      village,
      rate: Number(rate),
      isActive: true,
      createdAt: new Date(),
    });

    Alert.alert('Success', 'Customer added successfully');

    navigation.goBack();
  } catch (error) {
    console.log(error);
    Alert.alert('Error', 'Failed to save customer');
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Add Customer</Text>

<AppTextInput        placeholder="Customer Name"
        placeholderTextColor="#888"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

<AppTextInput        placeholder="Mobile Number"
        placeholderTextColor="#888"
        keyboardType="phone-pad"
        style={styles.input}
        value={mobile}
        onChangeText={setMobile}
      />

<AppTextInput        placeholder="Village"
        placeholderTextColor="#888"
        style={styles.input}
        value={village}
        onChangeText={setVillage}
      />

<AppTextInput        placeholder="Rate per Litre"
        placeholderTextColor="#888"
        keyboardType="numeric"
        style={styles.input}
        value={rate}
        onChangeText={setRate}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={onSave}>
        <Text style={styles.buttonText}>SAVE CUSTOMER</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: 25,
  },

  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
  },

  button: {
    backgroundColor: '#1976D2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});