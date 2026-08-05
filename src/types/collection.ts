export interface MilkCollection {
  id?: string;

  customerId: string;
  customerName: string;

  date: string;

  session: 'Morning' | 'Evening';

  quantity: number;

  fat: number;

  rate: number;

  amount: number;

  createdAt?: any;
}