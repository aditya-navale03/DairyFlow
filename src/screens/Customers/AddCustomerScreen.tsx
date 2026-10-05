import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';



import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

import CustomerForm from '../../components/customer/CustomerForm';
import LoadingOverlay from '../../components/common/LoadingOverlay';

import {
  addCustomer,
  updateCustomer,
  getCustomerByCollectionOrder,
  getNextAvailableCollectionOrder,
} from '../../services/customer/customerService';

import {
  moveCustomer,
  insertCustomerAtPosition,
} from '../../services/customer/customerOrderService';

import { CustomerStackParamList } from '../../navigation/CustomerNavigator';

type NavigationProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'AddCustomer'
>;

type RouteProps = RouteProp<
  CustomerStackParamList,
  'AddCustomer'
>;

export default function AddCustomerScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();

  const customer = route.params?.customer;

  const [name, setName] = useState(customer?.name ?? '');
  const [mobile, setMobile] = useState(customer?.mobile ?? '');
  const [rate, setRate] = useState(
    customer?.rate?.toString() ?? '',
  );

  const [collectionOrder, setCollectionOrder] = useState(
    customer?.collectionOrder?.toString() ?? '',
  );

  useEffect(() => {
    const loadNextCollectionOrder = async () => {
      if (customer) {
        return;
      }

      const nextNumber =
        await getNextAvailableCollectionOrder();

      setCollectionOrder(
        String(nextNumber),
      );
    };

    loadNextCollectionOrder();
  }, [customer]);

  const [loading, setLoading] = useState(false);

  const onSave = async () => {
    setLoading(true);

    if (!name || !mobile || !rate || !collectionOrder) {
      setLoading(false);
      Alert.alert('Validation', 'Please fill all fields');
      return;
    }

    const rateNumber = Number(rate);

    if (
      !rate ||
      isNaN(rateNumber) ||
      rateNumber <= 0
    ) {
      setLoading(false);
      Alert.alert(
        'Validation',
        'Please enter a valid rate',
      );
      return;
    }

    try {
      const existingCustomer =
        await getCustomerByCollectionOrder(
          Number(collectionOrder),
        );

      if (!customer && existingCustomer) {
        setLoading(false);

        Alert.alert(
          'Collection Number Exists',
          `${existingCustomer.name} already has collection number ${collectionOrder}.`,
          [
            {
              text: 'Insert Here',
              onPress: async () => {
                try {
                  setLoading(true);

                  await insertCustomerAtPosition({
                    name,
                    mobile,
                    rate: Number(rate),
                    collectionOrder: Number(collectionOrder),
                    isActive: true,
                    createdAt: new Date(),
                  });

                  setLoading(false);

                  Alert.alert(
                    'Success',
                    'Customer added successfully',
                  );

                  navigation.goBack();
                } catch (error) {
                  setLoading(false);

                  Alert.alert(
                    'Error',
                    'Failed to insert customer',
                  );
                }
              },
            },
            {
              text: 'Change Number',
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ],
        );

        return;
      }

      if (customer?.id) {
        await updateCustomer(customer.id, {
          name,
          mobile,
          rate: Number(rate),
        });

        await moveCustomer(
          {
            ...customer,
            name,
            mobile,
            rate: Number(rate),
          },
          Number(collectionOrder),
        );

        Alert.alert(
          'Success',
          'Customer updated successfully',
        );
      } else {
        await addCustomer({
          name,
          mobile,
          rate: Number(rate),
          collectionOrder: Number(collectionOrder),
          isActive: true,
          createdAt: new Date(),
        });

        Alert.alert(
          'Success',
          'Customer added successfully',
        );
      }

      setLoading(false);
      navigation.goBack();

    } catch (error) {
      setLoading(false);

      console.log(error);

      Alert.alert(
        'Error',
        'Operation failed',
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>

          <Text style={styles.backText}>
            ← Back
          </Text>

        </TouchableOpacity>

        <Text style={styles.title}>
          {customer
            ? 'Edit Customer'
            : 'Add Customer'}
        </Text>

      </View>

      <View style={styles.formContainer}>

        <CustomerForm
          name={name}
          mobile={mobile}
          rate={rate}
          collectionOrder={collectionOrder}
          setName={setName}
          setMobile={setMobile}
          setRate={setRate}
          setCollectionOrder={setCollectionOrder}
          buttonTitle={
            customer
              ? 'UPDATE CUSTOMER'
              : 'SAVE CUSTOMER'
          }
          onSubmit={onSave}
        />

      </View>

      <LoadingOverlay
        visible={loading}
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

  header: {
    marginTop: 10,
  },

  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
  },

  backText: {
    color: '#1976D2',
    fontSize: 15,
    fontWeight: '700',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1976D2',
  },

  formContainer: {
    marginTop: 1,
  },
});