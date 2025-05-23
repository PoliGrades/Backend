import { ZodError } from "zod";
import { IDatabase } from "../interfaces/IDatabase.ts";
import { IHandlerReturn } from "../interfaces/IHandlerReturn.ts";
import { IOrder } from "../interfaces/IOrder.ts";
import { OrderService } from "../services/OrderService.ts";

export class OrderHandler {
  private orderService: OrderService;

  constructor(db: IDatabase) {
    this.orderService = new OrderService(db);
  }

  async createOrder(order: IOrder, userId: number): Promise<IHandlerReturn> {
    try {
      order.userId = userId;
      order.createdAt = new Date();
      order.updatedAt = new Date();

      const newOrder = await this.orderService.createOrder(order, userId);

      return {
        status: 201,
        message: "Order created successfully",
        data: newOrder,
      };
    } catch (error: unknown) {
      if (!(error instanceof Error)) {
        throw error;
      }

      if (error instanceof ZodError) {
        return {
          status: 400,
          message: "Invalid order data",
          error: error.errors.map((e) => e.message).join(", "),
        };
      }

      return {
        status: 500,
        message: "Error creating order",
        error: error.message,
      };
    }
  }

  async getOrders(): Promise<IHandlerReturn> {
    try {
      const orders = await this.orderService.getOrders();
      for (const order of orders) {
        //@ts-ignore yes
        delete order.table;
      }

      return {
        status: 200,
        message: "Orders retrieved successfully",
        data: orders,
      };
    } catch (error: unknown) {
      if (!(error instanceof Error)) {
        throw error;
      }

      return {
        status: 500,
        message: "Error retrieving orders",
        error: error.message,
      };
    }
  }

  async getOrderById(id: number, userId: number): Promise<IHandlerReturn> {
    try {
      const order = await this.orderService.getOrder(id);
      if (!order) {
        return {
          status: 404,
          message: "Order not found",
        };
      } else if (order.userId !== userId) {
        return {
          status: 403,
          message: "You do not have permission to access this order",
        };
      }

      return {
        status: 200,
        message: "Order retrieved successfully",
        data: order,
      };
    } catch (error: unknown) {
      if (!(error instanceof Error)) {
        throw error;
      }

      return {
        status: 500,
        message: "Error retrieving order",
        error: error.message,
      };
    }
  }

  async getOrdersByUserId(userId: number): Promise<IHandlerReturn> {
    try {
      const orders = await this.orderService.getOrderById(userId);
      if (!orders) {
        return {
          status: 404,
          message: "No orders found for this user",
        };
      }

      return {
        status: 200,
        message: "Orders retrieved successfully",
        data: orders,
      };
    } catch (error: unknown) {
      if (!(error instanceof Error)) {
        throw error;
      }

      return {
        status: 500,
        message: "Error retrieving orders",
        error: error.message,
      };
    }
  }

  async deleteOrder(id: number): Promise<IHandlerReturn> {
    try {
      const deletedOrder = await this.orderService.deleteOrder(id);
      if (!deletedOrder) {
        return {
          status: 404,
          message: "Order not found",
        };
      }
      return {
        status: 200,
        message: "Order deleted successfully",
        data: deletedOrder,
      };
    } catch (error: unknown) {
      if (!(error instanceof Error)) {
        throw error;
      }

      return {
        status: 500,
        message: "Error deleting order",
        error: error.message,
      };
    }
  }

  async updateOrder(
    id: number,
    order: IOrder,
    userId: number,
  ): Promise<IHandlerReturn> {
    try {
      const userOrder = await this.orderService.getOrder(id);
      if (!userOrder) {
        return {
          status: 404,
          message: "Order not found",
        };
      } else if (userOrder.userId !== userId) {
        return {
          status: 403,
          message: "You do not have permission to update this order",
        };
      }

      const updatedOrder = await this.orderService.updateOrder(order, id);
      if (!updatedOrder) {
        return {
          status: 404,
          message: "Order not found",
        };
      }

      return {
        status: 200,
        message: "Order updated successfully",
        data: updatedOrder,
      };
    } catch (error: unknown) {
      if (!(error instanceof Error)) {
        throw error;
      }

      return {
        status: 500,
        message: "Error updating order",
        error: error.message,
      };
    }
  }

  async updateOrderStatus(
    id: number,
    status: "pending" | "completed" | "canceled",
    paymentMethod: "credit_card" | "debit_card" | "pix" | "cash",
  ): Promise<IHandlerReturn> {
    try {
      const userOrder = await this.orderService.getOrder(id);
      if (!userOrder) {
        return {
          status: 404,
          message: "Order not found",
        };
      }

      const updatedOrder = await this.orderService.updateOrderStatus(
        id,
        status,
        paymentMethod,
      );
      if (!updatedOrder) {
        return {
          status: 404,
          message: "Order not found",
        };
      }

      return {
        status: 200,
        message: "Order status updated successfully",
        data: updatedOrder,
      };
    } catch (error: unknown) {
      if (!(error instanceof Error)) {
        throw error;
      }

      return {
        status: 500,
        message: "Error updating order status",
        error: error.message,
      };
    }
  }
}
