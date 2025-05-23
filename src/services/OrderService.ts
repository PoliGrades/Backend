import {
  orderItem as orderItemTable,
  order as orderTable,
  product as productTable,
} from "../database/schema.ts";
import { IDatabase } from "../interfaces/IDatabase.ts";
import { IOrder } from "../interfaces/IOrder.ts";
import { orderSchema } from "../schemas/zodSchema.ts";
import { validateData } from "./decorators.ts";

export class OrderService {
  private db: IDatabase;

  constructor(db: IDatabase) {
    this.db = db;
  }

  @validateData(orderSchema)
  async createOrder(order: Partial<IOrder>, id: number) {
    order = {
      ...order,
      userId: id,
    };

    const newOrder = await this.db.insert(orderTable, {
      userId: order.userId,
      status: order.status,
      total: order.total,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as IOrder);
    if (!newOrder) {
      throw new Error("There was an error creating your order");
    }

    const orderId = newOrder.id;

    //@ts-ignore yes
    for (const item of order.items) {
      await this.createOrderItem(orderId, item);
    }

    return newOrder.id;
  }

  async createOrderItem(orderId: number, item: Partial<IOrder["items"][0]>) {
    const order = await this.db.select(orderTable, orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const newItem = await this.db.insert(orderItemTable, {
      orderId: orderId,
      productId: item.id,
      quantity: item.quantity,
      observation: item.observation,
      price: item.price,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (!newItem) {
      throw new Error("There was an error creating your order item");
    }
    return newItem.id;
  }

  async getOrderItems(orderId: number) {
    const order = await this.db.select(orderTable, orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const items = await this.db.selectByField(
      orderItemTable,
      "orderId",
      orderId,
    );
    if (!items) {
      throw new Error("No items found for this order");
    }

    for (const item of items) {
      const product = await this.db.selectByField(
        productTable,
        "id",
        item.productId,
      );
      if (!product) {
        throw new Error("Product not found");
      }
      //@ts-ignore yes
      item.name = product[0].name;
    }

    for (const item of items) {
      //@ts-ignore yes
      delete item.table;
    }

    return items;
  }

  async getOrder(id: number) {
    const order = await this.db.select(orderTable, id);
    if (!order) {
      throw new Error("Order not found");
    }

    const items = await this.getOrderItems(id);
    //@ts-ignore yes
    order.items = items;

    return order;
  }

  async getOrderById(userId: number) {
    const order = await this.db.selectByField(orderTable, "userId", userId);
    if (!order) {
      throw new Error("Order not found");
    }

    return order;
  }

  async getOrders() {
    const orders = await this.db.selectAll(orderTable);
    for (const order of orders) {
      const items = await this.getOrderItems(order.id);
      //@ts-ignore yes
      order.items = items;
    }

    if (!orders) {
      throw new Error("No orders found");
    }

    console.log(orders);

    return orders;
  }

  @validateData(orderSchema)
  async updateOrder(order: IOrder, id: number) {
    const existingOrder = await this.db.select(orderTable, id);
    if (!existingOrder) {
      throw new Error("Order not found");
    }

    // @ts-ignore yes
    delete existingOrder.table;

    const updatedOrder = await this.db.update(orderTable, id, order);
    return updatedOrder.id;
  }

  async deleteOrder(id: number) {
    const existingOrder = await this.db.select(orderTable, id);
    if (!existingOrder) {
      throw new Error("Order not found");
    }

    const deletedOrder = await this.db.delete(orderTable, id);
    return deletedOrder;
  }

  async updateOrderStatus(
    id: number,
    status: "pending" | "completed" | "canceled",
    paymentMethod: "credit_card" | "debit_card" | "pix" | "cash",
  ) {
    const existingOrder = await this.db.select(orderTable, id);
    if (!existingOrder) {
      throw new Error("Order not found");
    }

    const updatedOrder = await this.db.update(orderTable, id, { status, paymentMethod });
    return updatedOrder;
  }
}
