import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  updateDoc,
  doc,
} from '@react-native-firebase/firestore';

const db = getFirestore();
const billsRef = collection(db, 'bills');

export const saveBillPayment = async (
  customerId: string,
  month: string,
  totalAmount: number,
  paidAmount: number,
) => {
  const q = query(
    billsRef,
    where('customerId', '==', customerId),
    where('month', '==', month),
  );

  const snapshot = await getDocs(q);

  const remainingAmount = Math.max(
    totalAmount - paidAmount,
    0,
  );

  const status =
    remainingAmount <= 0
      ? 'Paid'
      : 'Pending';

  if (!snapshot.empty) {
    const existingDoc = snapshot.docs[0];

    await updateDoc(
      doc(db, 'bills', existingDoc.id),
      {
        totalAmount,
        paidAmount,
        remainingAmount,
        status,
      },
    );

    return;
  }

  await addDoc(billsRef, {
    customerId,
    month,
    totalAmount,
    paidAmount,
    remainingAmount,
    status,
  });
};

export const subscribeToBillPayments = (
  month: string,
  callback: (bills: any[]) => void,
) => {
  const q = query(
    billsRef,
    where('month', '==', month),
  );

  return onSnapshot(q, snapshot => {
    const bills = snapshot.docs.map(item => ({
      id: item.id,
      ...item.data(),
    }));

    callback(bills);
  });
};