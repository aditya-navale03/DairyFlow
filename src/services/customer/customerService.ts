import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  query,
where,
orderBy,
writeBatch,
} from '@react-native-firebase/firestore';

import {Customer} from '../../types/customer';

const db = getFirestore();
const customersRef = collection(db, 'customers');

export const createCustomer = async (
  customer: Customer,
) => {

};

export const getCustomerByCollectionOrder = async (
  collectionOrder: number,
) => {
  const customers = await getCustomers();

  return (
    customers.find(
      customer => customer.collectionOrder === collectionOrder,
    ) ?? null
  );
};

export const addCustomer = async (customer: Customer) => {
  return await addDoc(customersRef, {
    ...customer,
    createdAt: serverTimestamp(),
  });
};

export const getCustomers = async () => {
  const snapshot = await getDocs(customersRef);

  const customers = snapshot.docs.map(item => ({
  id: item.id,
  ...item.data(),
})) as Customer[];

return customers.sort(
  (a, b) => a.collectionOrder - b.collectionOrder,
);
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

export const subscribeToCustomers = (
  callback: (customers: Customer[]) => void,
) => {
  return onSnapshot(customersRef, snapshot => {
    const customers = snapshot.docs.map(item => ({
      id: item.id,
      ...item.data(),
    })) as Customer[];

    customers.sort(
      (a, b) =>
        a.collectionOrder - b.collectionOrder,
    );

    callback(customers);
  });
};