import {moveCustomer} from '../../services/customer/customerOrderService';

import LoadingOverlay from '../../components/common/LoadingOverlay';

import {insertCustomerAtPosition} from '../../services/customer/customerOrderService';

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
  getCustomerByCollectionOrder,
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
const [collectionOrder, setCollectionOrder] = useState(
  customer?.collectionOrder?.toString() ?? '',
);

const [loading, setLoading] = useState(false);

const navigation = useNavigation<NavigationProp>();

  const onSave = async () => {
    setLoading(true);
  if (!name || !mobile || !village || !rate) {
    setLoading(false);
    Alert.alert('Validation', 'Please fill all fields');
    return;
  }

const existingCustomer = await getCustomerByCollectionOrder(
  Number(collectionOrder),
);

if (!customer && existingCustomer) {
  Alert.alert(
    'Collection Number Exists',
    `${existingCustomer.name} already has collection number ${collectionOrder}.`,
    [
      {
        text: 'Insert Here',
        onPress: async () => {
          try {
            await insertCustomerAtPosition({
              name,
              mobile,
              village,
              rate: Number(rate),
              collectionOrder: Number(collectionOrder),
              isActive: true,
              createdAt: new Date(),
            });

            setLoading(false);
            Alert.alert('Success', 'Customer added successfully');
            navigation.goBack();
          } catch (error) {
            setLoading(false);
            Alert.alert('Error', 'Failed to insert customer');
          }
        },
      },
      {
        text: 'Change Number',
        onPress: () => setLoading(false),
      },
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => setLoading(false),
      },
    ],
  );

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

await moveCustomer(
  {
    ...customer,
    name,
    mobile,
    village,
    rate: Number(rate),
  },
  Number(collectionOrder),
);

    Alert.alert('Success', 'Customer updated successfully');
  } else {
  await addCustomer({
    name,
    mobile,
    village,
    rate: Number(rate),
    collectionOrder: Number(collectionOrder),
    isActive: true,
    createdAt: new Date(),
  });

  Alert.alert('Success', 'Customer added successfully');
}
  setLoading(false);
  navigation.goBack();
} catch (error) {
  setLoading(false);
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

      collectionOrder={collectionOrder}
setCollectionOrder={setCollectionOrder}

      setName={setName}
      setMobile={setMobile}
      setVillage={setVillage}
      setRate={setRate}
buttonTitle={
  customer ? 'UPDATE CUSTOMER' : 'SAVE CUSTOMER'
}
      onSubmit={onSave}
    />
    <LoadingOverlay visible={loading}
    text={
      customer
        ? 'Updating customer...'
        : 'Saving customer...'
    }
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