import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  collectionGroup,
} from '@react-native-firebase/firestore';

import { MilkCollection } from '../../types/collection';

// import { recalculateSavedBill } from '../billing/billingService';

const db = getFirestore();


/*
 * COLLECTION STRUCTURE:
 *
 * collections
 *   └── 2026-08-21
 *         └── entries
 *               ├── collection1
 *               ├── collection2
 *               └── collection3
 */


/*
 * ADD MILK COLLECTION
 */

const billsRef = collection(db, 'bills');
const paymentsRef = collection(db, 'payments');

export const addMilkCollection = async (
  data: MilkCollection,
) => {
  const date = data.dateString;

  const ref = await addDoc(
    collection(
      db,
      'collections',
      date,
      'entries',
    ),
    {
      ...data,
      dateString: date,
    },
  );

  console.log(
    'Saved collection:',
    ref.id,
    'Date:',
    date,
  );
};

/*
 * GET COLLECTIONS BY DATE + SESSION
 */
export const getCollectionsByDate = async (
  date: string,
  session: 'Morning' | 'Evening',
) => {
  const q = query(
    collection(
      db,
      'collections',
      date,
      'entries',
    ),
    where('session', '==', session),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(item => ({
    id: item.id,
    ...item.data(),
  })) as MilkCollection[];
};


/*
 * REAL-TIME COLLECTIONS BY DATE + SESSION
 */
export const subscribeToCollectionsByDate = (
  date: string,
  session: 'Morning' | 'Evening',
  callback: (collections: MilkCollection[]) => void,
) => {

  const q = query(
    collection(
      db,
      'collections',
      date,
      'entries',
    ),
    where('session', '==', session),
  );

  return onSnapshot(
    q,
    snapshot => {

      const collections =
        snapshot.docs.map(item => ({
          id: item.id,
          ...item.data(),
        })) as MilkCollection[];

      callback(collections);
    },

    error => {
      console.log(
        'Collection subscription error:',
        error,
      );

      callback([]);
    },
  );
};
/*
 * GET ONE CUSTOMER'S COLLECTION
 */
export const getCustomerCollection = async (
  customerId: string,
  date: string,
  session: 'Morning' | 'Evening',
) => {
  const q = query(
    collection(
      db,
      'collections',
      date,
      'entries',
    ),
    where('customerId', '==', customerId),
    where('session', '==', session),
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  return {
    id: snapshot.docs[0].id,
    ...snapshot.docs[0].data(),
  } as MilkCollection;
};


/*
 * REAL-TIME MONTHLY COLLECTIONS
 *
 * Searches all "entries" subcollections.
 */
export const subscribeToCollectionsByMonth = (
  monthStart: string,
  monthEnd: string,
  callback: (collections: MilkCollection[]) => void,
) => {

  const q = query(
    collectionGroup(db, 'entries'),
  );

  return onSnapshot(
    q,
    snapshot => {

      const allCollections =
        snapshot.docs.map(item => ({
          id: item.id,
          ...item.data(),
        })) as MilkCollection[];

      const monthlyCollections =
        allCollections.filter(item =>
          item.dateString >= monthStart &&
          item.dateString <= monthEnd,
        );

      callback(monthlyCollections);
    },

    error => {
      console.log(
        'Monthly collection error:',
        error,
      );

      callback([]);
    },
  );
};
/*
 * DELETE COLLECTION
 */
export const deleteCollection = async (
  date: string,
  collectionId: string,
) => {
  await deleteDoc(
    doc(
      db,
      'collections',
      date,
      'entries',
      collectionId,
    ),
  );
};
export const getCustomerCollectionsByDateRange = async (
  customerId: string,
  startDate: string,
  endDate: string,
) => {
  const q = collectionGroup(
    db,
    'entries',
  );

  const snapshot = await getDocs(q);

  const collections: MilkCollection[] =
    snapshot.docs.map(item => ({
      id: item.id,
      ...item.data(),
    })) as MilkCollection[];

  return collections.filter(item => {
    return (
      item.customerId === customerId &&
      item.dateString >= startDate &&
      item.dateString <= endDate
    );
  });
};


export const updateMilkCollection = async (
  date: string,
  collectionId: string,
  quantity: number,
  rate: number,
) => {
  const collectionRef = doc(
    db,
    'collections',
    date,
    'entries',
    collectionId,
  );

  // Read the collection before changing it.
  const existingSnapshot = await getDocs(
    query(
      collection(db, 'collections', date, 'entries'),
      where('__name__', '==', collectionId),
    ),
  );

  if (existingSnapshot.empty) {
    throw new Error('Collection not found.');
  }

  const existingData = existingSnapshot.docs[0].data();
  const customerId = existingData.customerId;

  // Update the collection.
  await updateDoc(collectionRef, {
    quantity,
    rate,
    amount: quantity * rate,
  });

  if (!customerId) {
    return;
  }

  // Get all entries and calculate this customer's updated monthly bill.
  const allEntries = await getDocs(
    collectionGroup(db, 'entries'),
  );

  const month = date.slice(0, 7);

  const newBillAmount = allEntries.docs.reduce(
    (total, item) => {
      const entry = item.data();

      if (
        entry.customerId === customerId &&
        typeof entry.dateString === 'string' &&
        entry.dateString.startsWith(month)
      ) {
        return total + Number(
          item.id === collectionId &&
          item.ref.parent.parent?.id === date
            ? quantity * rate
            : entry.amount || 0,
        );
      }

      return total;
    },
    0,
  );

  await recalculateSavedBill(
    customerId,
    month,
    newBillAmount,
  );
};


export const recalculateSavedBill = async (
  customerId: string,
  month: string,
  billAmount: number,
) => {
  const q = query(
    billsRef,
    where('customerId', '==', customerId),
    where('month', '==', month),
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const billDoc = snapshot.docs[0];
  const savedBill = billDoc.data();

  // Preserve the total cash received; do not create payment history.
  const previousAdvanceUsed = Number(
    savedBill.previousAdvanceUsed || 0,
  );
  const totalCashReceived =
    Number(savedBill.cashPaid || 0) +
    Number(savedBill.advanceAmount || 0);

  const cashNeeded = Math.max(
    billAmount - previousAdvanceUsed,
    0,
  );

  const cashPaid = Math.min(totalCashReceived, cashNeeded);
  const advanceAmount = Math.max(
    totalCashReceived - cashPaid,
    0,
  );
  const paidAmount = previousAdvanceUsed + cashPaid;
  const remainingAmount = Math.max(
    billAmount - paidAmount,
    0,
  );

  const status = remainingAmount === 0 ? 'Paid' : 'Pending';

  await updateDoc(doc(db, 'bills', billDoc.id), {
    billAmount,
    cashPaid,
    advanceAmount,
    paidAmount,
    remainingAmount,
    status,
  });

  return {
    ...savedBill,
    billAmount,
    cashPaid,
    advanceAmount,
    paidAmount,
    remainingAmount,
    status,
  };
};

