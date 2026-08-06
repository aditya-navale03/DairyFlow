import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from '@react-native-firebase/firestore';

import {MilkCollection} from '../../types/collection';

const db = getFirestore();

export const addMilkCollection = async (
  data: MilkCollection,
) => {
  await addDoc(
    collection(db, 'collections'),
    data,
  );
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