import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  onSnapshot,
} from '@react-native-firebase/firestore';

import {MilkCollection} from '../../types/collection';

const db = getFirestore();
import {Alert} from 'react-native';

export const addMilkCollection = async (
  data: MilkCollection,
) => {
  const ref = await addDoc(
    collection(db, 'collections'),
    data,
  );

  console.log('Saved:', ref.id);
};

export const getCollectionsByDate = async (
  date: string,
  session: 'Morning' | 'Evening',
) => {
  const q = query(
    collection(db, 'collections'),
    where('dateString', '==', date),
    where('session', '==', session),
  );

  

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as MilkCollection[];
};

export const subscribeToCollectionsByDate = (
  date: string,
  session: 'Morning' | 'Evening',
  callback: (collections: MilkCollection[]) => void,
) => {
  const q = query(
    collection(db, 'collections'),
    where('dateString', '==', date),
    where('session', '==', session),
  );

  return onSnapshot(q, snapshot => {
    const collections = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as MilkCollection[];

    callback(collections);
  });
};

export const getCustomerCollection = async (
  customerId: string,
  date: string,
  session: 'Morning' | 'Evening',
) => {
  const q = query(
    collection(db, 'collections'),
    where('customerId', '==', customerId),
    where('dateString', '==', date),
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