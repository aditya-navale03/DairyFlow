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

  const previousAdvanceUsed = Number(
    savedBill.previousAdvanceUsed || 0,
  );

  const savedCashPaid = Number(savedBill.cashPaid || 0);
  const savedAdvance = Number(savedBill.advanceAmount || 0);

  // Cash already received includes cash allocated to the bill
  // plus any advance saved from that payment.
  const totalCashReceived = savedCashPaid + savedAdvance;

  // Reallocate existing cash to the updated bill.
  const cashNeededAfterPreviousAdvance = Math.max(
    billAmount - previousAdvanceUsed,
    0,
  );

  const cashPaid = Math.min(
    totalCashReceived,
    cashNeededAfterPreviousAdvance,
  );

  const advanceAmount = Math.max(
    totalCashReceived - cashPaid,
    0,
  );

  const paidAmount = previousAdvanceUsed + cashPaid;
  const remainingAmount = Math.max(
    billAmount - paidAmount,
    0,
  );

  const status =
    remainingAmount <= 0 ? 'Paid' : 'Pending';

  const updatedBill = {
    billAmount,
    cashPaid,
    advanceAmount,
    paidAmount,
    remainingAmount,
    status,
  };

  await updateDoc(
    doc(db, 'bills', billDoc.id),
    updatedBill,
  );

  return {
    ...savedBill,
    ...updatedBill,
    previousAdvanceUsed,
  };
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
  previousAdvanceUsed: number,
) => {
  await addDoc(paymentsRef, {
    customerId,
    month,
    amount,
    previousAdvanceUsed,
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

export const getCustomerBill = async (
  customerId: string,
  monthString: string,
) => {
  const q = query(
    billsRef,
    where('customerId', '==', customerId),
    where('month', '==', monthString),
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  return {
    id: snapshot.docs[0].id,
    ...snapshot.docs[0].data(),
  };
};