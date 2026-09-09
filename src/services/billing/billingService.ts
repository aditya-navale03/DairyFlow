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

const paymentsRef = collection(db, 'payments');

export const saveBillPayment = async (
  customerId: string,
  month: string,
  billAmount: number,
  previousAdvanceUsed: number,
  cashPaid: number,
  advanceAmount: number,
) => {
  const q = query(
    billsRef,
    where('customerId', '==', customerId),
    where('month', '==', month),
  );

  const snapshot = await getDocs(q);

  const paidAmount =
    previousAdvanceUsed + cashPaid;

  const remainingAmount =
    Math.max(
      billAmount - paidAmount,
      0,
    );

  const status =
    remainingAmount <= 0
      ? 'Paid'
      : 'Pending';

  const data = {
    customerId,
    month,

    // Original bill from milk collection
    billAmount,

    // Previous month's advance used for this bill
    previousAdvanceUsed,

    // Cash paid this month
    cashPaid,

    // Total paid
    paidAmount,

    // Remaining bill
    remainingAmount,

    // New advance for next month
    advanceAmount,

    status,
  };

  if (!snapshot.empty) {
    await updateDoc(
      doc(
        db,
        'bills',
        snapshot.docs[0].id,
      ),
      data,
    );

    return;
  }

  await addDoc(
    billsRef,
    data,
  );
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
  const [year, month] =
    currentMonth.split('-').map(Number);

  const previousDate = new Date(
    year,
    month - 2,
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

  const snapshot =
    await getDocs(q);

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
      Number(bill.advanceAmount || 0),
    previousMonth,
  };
};

export const savePaymentHistory = async (
  customerId: string,
  month: string,
  amount: number,
) => {
  await addDoc(paymentsRef, {
    customerId,
    month,
    amount,
    type: 'cash',
    createdAt: new Date(),
  });
};
export const getCustomerPaymentHistory = async (
  customerId: string,
  monthString: string,
) => {
  const q = query(
    paymentsRef,
    where('customerId', '==', customerId),
    where('month', '==', monthString),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(item => ({
    id: item.id,
    ...item.data(),
  }));
};