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
  await updateDoc(
    doc(
      db,
      'collections',
      date,
      'entries',
      collectionId,
    ),
    {
      quantity,
      rate,
    },
  );
}