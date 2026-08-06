export interface MilkCollection {
  id?: string;

  customerId: string;
  customerName: string;

  collectionOrder: number;

  date: Date;

  dateString: string;

  session: 'Morning' | 'Evening';

  quantity: number;

  fat: number;

  rate: number;

  amount: number;

  createdAt?: Date;
}