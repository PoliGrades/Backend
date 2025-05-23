export type IOrder = {
  id?: number;
  userId: number;
  status: "pending" | "completed" | "canceled";
  items: IOrderItem[];
  paymentMethod: "credit_card" | "debit_card" | "pix" | "cash";
  total: number;
  createdAt: Date;
  updatedAt: Date;
};

export interface IOrderItem {
  id?: number;
  name: string;
  price: number;
  quantity: number;
  observation?: string;
}
