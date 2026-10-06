import {
  getFirestore,
  collection,
  getDocs,
   writeBatch,
  doc,
  addDoc,
} from '@react-native-firebase/firestore';

import {Customer} from '../../types/customer';

const db = getFirestore();

export const getAllCustomers = async () => {
  const snapshot = await getDocs(collection(db, 'customers'));

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Customer[];
};

export const checkCollectionNumber = async (
  collectionOrder: number,
) => {
  const customers = await getAllCustomers();

  return (
    customers.find(
      customer =>
        customer.collectionOrder === collectionOrder,
    ) ?? null
  );
};

export const insertCustomerAtPosition = async (
  customer: Customer,
) => {

  const snapshot = await getDocs(collection(db, 'customers'));

  const customers = snapshot.docs
  .map(item => ({
    id: item.id,
    ...item.data(),
  })) as Customer[];

customers.sort(
  (a, b) => b.collectionOrder - a.collectionOrder,
);

  const batch = writeBatch(db);

  customers.forEach((c: any) => {
    if (
      c.collectionOrder >= customer.collectionOrder
    ) {
      const ref = doc(db, 'customers', c.id);

      batch.update(ref, {
        collectionOrder: c.collectionOrder + 1,
      });
    }
  });

  await batch.commit();

  await addDoc(collection(db, 'customers'), customer);
};

import {deleteDoc} from '@react-native-firebase/firestore';

export const deleteCustomerAndReorder = async (
  customer: Customer,
) => {
  const snapshot = await getDocs(collection(db, 'customers'));

  const customers = snapshot.docs
    .map(item => ({
      id: item.id,
      ...item.data(),
    })) as Customer[];

  const batch = writeBatch(db);

  // Delete selected customer
  batch.delete(doc(db, 'customers', customer.id!));

  // Shift remaining customers
  customers.forEach(c => {
    if (
      c.id !== customer.id &&
      c.collectionOrder > customer.collectionOrder
    ) {
      batch.update(doc(db, 'customers', c.id!), {
        collectionOrder: c.collectionOrder - 1,
      });
    }
  });

  await batch.commit();
};

export const moveCustomer = async (
  customer: Customer,
  newOrder: number,
) => {
  const snapshot = await getDocs(
    collection(db, 'customers'),
  );

  const customers = snapshot.docs.map(item => ({
    id: item.id,
    ...item.data(),
  })) as Customer[];

  if (!customer.id) return;

  // Sort by current collection number
  customers.sort(
    (a, b) =>
      Number(a.collectionOrder || 0) -
      Number(b.collectionOrder || 0),
  );

  // Remove the customer being moved
  const remainingCustomers = customers.filter(
    c => c.id !== customer.id,
  );

  // Keep the new position within valid range
  const safeOrder = Math.max(
    1,
    Math.min(newOrder, customers.length),
  );

  // Insert customer at the requested position
  remainingCustomers.splice(
    safeOrder - 1,
    0,
    customer,
  );

  const batch = writeBatch(db);

  // Re-number EVERY customer sequentially
  remainingCustomers.forEach(
    (c, index) => {
      if (!c.id) return;

      batch.update(
        doc(db, 'customers', c.id),
        {
          collectionOrder: index + 1,
        },
      );
    },
  );

  await batch.commit();
};