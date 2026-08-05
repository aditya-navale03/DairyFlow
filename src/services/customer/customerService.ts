import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from '@react-native-firebase/firestore';

import {Customer} from '../../types/customer';

const db = getFirestore();
const customersRef = collection(db, 'customers');

export const addCustomer = async (customer: Customer) => {
  return await addDoc(customersRef, {
    ...customer,
    createdAt: serverTimestamp(),
  });
};

export const getCustomers = async () => {
  const snapshot = await getDocs(customersRef);

  return snapshot.docs.map(item => ({
    id: item.id,
    ...item.data(),
  })) as Customer[];
};

export const updateCustomer = async (
  id: string,
  customer: Partial<Customer>,
) => {
  const customerRef = doc(db, 'customers', id);
  return await updateDoc(customerRef, customer);
};

export const deleteCustomer = async (id: string) => {
  const customerRef = doc(db, 'customers', id);
  return await deleteDoc(customerRef);
};