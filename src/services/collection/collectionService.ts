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

import {MilkCollection} from '../../types/collection';

const db = getFirestore();

const collectionRef = collection(db, 'milkCollections');

export const addCollection = async (
  data: MilkCollection,
) => {
  return await addDoc(collectionRef, {
    ...data,
    createdAt: serverTimestamp(),
  });
};

export const getCollections = async () => {
  const snapshot = await getDocs(collectionRef);

  return snapshot.docs.map(item => ({
    id: item.id,
    ...item.data(),
  })) as MilkCollection[];
};

export const updateCollection = async (
  id: string,
  data: Partial<MilkCollection>,
) => {
  const ref = doc(db, 'milkCollections', id);

  return await updateDoc(ref, data);
};

export const deleteCollection = async (
  id: string,
) => {
  const ref = doc(db, 'milkCollections', id);

  return await deleteDoc(ref);
};