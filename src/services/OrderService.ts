import { order as orderTable } from "../database/schema.ts";
import { IDatabase } from "../interfaces/IDatabase.ts";
import { IOrder } from "../interfaces/IOrder.ts";
import { orderSchema } from "../schemas/zodSchema.ts";
import { validateData } from "./decorators.ts";

export class OrderService{
    private db: IDatabase;
    
    constructor(db: IDatabase) {
        this.db = db;
    }

    @validateData(orderSchema)
    async createOrder(order: Partial<IOrder>, id: number) {
        order = {
            ...order,
            userId: id
        }

        const newOrder = await this.db.insert(orderTable, order as IOrder)
        if (!newOrder) {
            throw new Error("There was an error creating your order");
        }

        return newOrder.id
    }

    async getOrder(id: number) {
        const order = await this.db.select(orderTable, id)
        if (!order) {
            throw new Error("Order not found")
        }

        return order;
    }

    @validateData(orderSchema)
    async updateOrder(order: IOrder, id: number) {
        const existingOrder = await this.db.select(orderTable, id)
        if (!existingOrder) {
            throw new Error("Order not found")
        }

        const updatedOrder = await this.db.update(orderTable, id, order)
        return updatedOrder.id
    }
}