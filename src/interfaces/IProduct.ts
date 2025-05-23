export interface IProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  available: boolean;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}
