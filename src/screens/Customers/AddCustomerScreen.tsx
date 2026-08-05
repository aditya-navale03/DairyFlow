
import {useRoute} from '@react-navigation/native';
import {RouteProp} from '@react-navigation/native';

type RouteProps = RouteProp<
  CustomerStackParamList,
  'AddCustomer'
>;

import CustomerForm from '../../components/customer/CustomerForm';

import {
  addCustomer,
  updateCustomer,
} from '../../services/customer/customerService';

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
} from 'react-native';

import React, {useState} from 'react';

export default function AddCustomerScreen() {

  const route = useRoute<RouteProps>();

const customer = route.params?.customer;
const [name, setName] = useState(customer?.name ?? '');
const [mobile, setMobile] = useState(customer?.mobile ?? '');
const [village, setVillage] = useState(customer?.village ?? '');
const [rate, setRate] = useState(customer?.rate?.toString() ?? '');
const navigation = useNavigation<NavigationProp>();
  const onSave = async () => {
  if (!name || !mobile || !village || !rate) {
    Alert.alert('Validation', 'Please fill all fields');
    return;
  }
try {
  if (customer?.id) {
    await updateCustomer(customer.id, {
      name,
      mobile,
      village,
      rate: Number(rate),
    });

    Alert.alert('Success', 'Customer updated successfully');
  } else {
    await addCustomer({
      name,
      mobile,
      village,
      rate: Number(rate),
      isActive: true,
      createdAt: new Date(),
    });

    Alert.alert('Success', 'Customer added successfully');
  }

  navigation.goBack();
} catch (error) {
  console.log(error);
  Alert.alert('Error', 'Operation failed');
}
};

 return (
  <SafeAreaView style={styles.container}>
<Text style={styles.title}>
  {customer ? 'Edit Customer' : 'Add Customer'}
</Text>
    <CustomerForm
      name={name}
      mobile={mobile}
      village={village}
      rate={rate}
      setName={setName}
      setMobile={setMobile}
      setVillage={setVillage}
      setRate={setRate}
buttonTitle={
  customer ? 'UPDATE CUSTOMER' : 'SAVE CUSTOMER'
}
      onSubmit={onSave}
    />
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
});