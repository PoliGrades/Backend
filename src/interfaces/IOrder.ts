export type IOrder = {
    id?: number
    userId: number,
    items: IOrderItem[]
    total: number
    createdAt: Date
    updatedAt: Date
}

export interface IOrderItem {
    id?: number
    name: string
    price: number
    quantity: number
    observation?: string
}