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
    where(
      'customerId',
      '==',
      customerId,
    ),
    where(
      'month',
      '==',
      month,
    ),
  );

  const snapshot =
    await getDocs(q);

  const remainingAmount =
    totalAmount - paidAmount;

  const advanceAmount =
    Math.max(
      paidAmount - totalAmount,
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
        advanceAmount,
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
    advanceAmount,
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

export const getPreviousMonthAdvance = async (
  customerId: string,
  currentMonth: string,
) => {
  const currentDate = new Date(
    `${currentMonth}-01`,
  );

  currentDate.setMonth(
    currentDate.getMonth() - 1,
  );

  const previousMonth =
    `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1,
    ).padStart(2, '0')}`;

  const q = query(
    billsRef,
    where(
      'customerId',
      '==',
      customerId,
    ),
    where(
      'month',
      '==',
      previousMonth,
    ),
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return {
      advanceAmount: 0,
      previousMonth,
    };
  }

  const bill =
    snapshot.docs[0].data();

  return {
    advanceAmount:
      Number(
        bill.advanceAmount || 0,
      ),
    previousMonth,
  };
};

export const getPreviousAdvance = async (
  customerId: string,
  currentMonth: string,
) => {
  const [year, monthNumber] =
    currentMonth.split('-').map(Number);

  // Get previous month
  const previousDate = new Date(
    year,
    monthNumber - 2,
    1,
  );

  const previousMonth =
    `${previousDate.getFullYear()}-${String(
      previousDate.getMonth() + 1,
    ).padStart(2, '0')}`;

  const q = query(
    billsRef,
    where(
      'customerId',
      '==',
      customerId,
    ),
    where(
      'month',
      '==',
      previousMonth,
    ),
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return {
      advanceAmount: 0,
      advanceFromMonth: '',
    };
  }

  const previousBill =
    snapshot.docs[0].data();

  const advanceAmount = Number(
    previousBill.advanceAmount || 0,
  );

  return {
    advanceAmount,
    advanceFromMonth: previousMonth,
  };
};