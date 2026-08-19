export interface Customer {
  id?: string;
  name: string;
  mobile: string;
  rate: number;
  collectionOrder: number;
  isActive: boolean;
  createdAt: Date;
}