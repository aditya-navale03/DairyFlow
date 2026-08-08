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
  date: string,
  totalAmount: number,
  paidAmount: number,
) => {
  const q = query(
    billsRef,
    where('customerId', '==', customerId),
    where('date', '==', date),
  );

  const snapshot = await getDocs(q);

  const remainingAmount =
    Math.max(
      totalAmount - paidAmount,
      0,
    );

  const status =
    remainingAmount <= 0
      ? 'Paid'
      : 'Pending';

  if (!snapshot.empty) {
    const existingDoc =
      snapshot.docs[0];

    await updateDoc(
      doc(
        db,
        'bills',
        existingDoc.id,
      ),
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
    date,
    totalAmount,
    paidAmount,
    remainingAmount,
    status,
  });
};

export const subscribeToBillPayments = (
  date: string,
  callback: (
    bills: {
      customerId: string;
      totalAmount: number;
      paidAmount: number;
      remainingAmount: number;
      status: 'Paid' | 'Pending';
    }[],
  ) => void,
) => {
  const q = query(
    billsRef,
    where('date', '==', date),
  );

  return onSnapshot(q, snapshot => {
    const bills = snapshot.docs.map(
      item => ({
        id: item.id,
        ...item.data(),
      }),
    ) as any[];

    callback(bills);
  });
};