import { expect } from "jsr:@std/expect/expect";
import { beforeAll, describe, it } from "jsr:@std/testing/bdd";
import { MockDatabase } from "../src/database/MockDatabase.ts";
import { IOrder } from "../src/interfaces/IOrder.ts";
import { generateMockOrder } from "../src/mocks/Order.ts";
import { generateMockPassword, generateMockUser } from "../src/mocks/User.ts";
import { AuthenticationService } from "../src/services/AuthenticationService.ts";
import { OrderService } from "../src/services/OrderService.ts";

describe("Order service", () => {
  let user: number;

  beforeAll(async () => {
    const db = new MockDatabase();
    const authenticationService = new AuthenticationService(db);

    const newUser = generateMockUser();
    const userPassword = generateMockPassword();

    user = await authenticationService.registerUser(newUser, userPassword);
  });

  it("should create a new order", async () => {
    const db = new MockDatabase();
    const orderService = new OrderService(db);

    const order = generateMockOrder();

    const newOrder = await orderService.createOrder(order, user);

    expect(newOrder).toBeDefined();
  });

  it("should get an existing order", async () => {
    const db = new MockDatabase();
    const orderService = new OrderService(db);

    const order = generateMockOrder();

    const newOrder = await orderService.createOrder(order, user);

    const retrievedOrder = await orderService.getOrder(newOrder);

    expect(retrievedOrder).toBeDefined();
  });

  it("should not get a non existing order", async () => {
    const db = new MockDatabase();
    const orderService = new OrderService(db);

    const order = generateMockOrder();

    const _newOrder = await orderService.createOrder(order, user);

    try {
      await orderService.getOrder(0);
    } catch (error: unknown) {
      if (!(error instanceof Error)) {
        throw error;
      }

      expect(error.message).toBe("Order not found");
    }
  });

  it("should update an existing order", async () => {
    const db = new MockDatabase();
    const orderService = new OrderService(db);

    const order = generateMockOrder();

    const newOrder = await orderService.createOrder(order, user);

    const order_2 = generateMockOrder();
    order_2.userId = user;

    expect(newOrder).toBeDefined();

    const updatedOrder = await orderService.updateOrder(
      order_2 as Required<IOrder>,
      newOrder,
    );

    expect(updatedOrder).toBeDefined();
  });

  it("should not update a non existing order", async () => {
    const db = new MockDatabase();
    const orderService = new OrderService(db);

    const order = generateMockOrder();

    const _newOrder = await orderService.createOrder(order, user);

    try {
      await orderService.updateOrder(order as Required<IOrder>, 0);
    } catch (error: unknown) {
      if (!(error instanceof Error)) {
        throw error;
      }

      expect(error.message).toBe("Order not found");
    }
  });

  it("should delete an existing order", async () => {
    const db = new MockDatabase();
    const orderService = new OrderService(db);

    const order = generateMockOrder();

    const newOrder = await orderService.createOrder(order, user);

    expect(newOrder).toBeDefined();

    const deletedOrder = await orderService.deleteOrder(newOrder);

    expect(deletedOrder).toBeDefined();
  });

  it("should not delete a non existing order", async () => {
    const db = new MockDatabase();
    const orderService = new OrderService(db);

    const order = generateMockOrder();

    const _newOrder = await orderService.createOrder(order, user);

    try {
      await orderService.deleteOrder(0);
    } catch (error: unknown) {
      if (!(error instanceof Error)) {
        throw error;
      }

      expect(error.message).toBe("Order not found");
    }
  });

  it("should get all orders", async () => {
    const db = new MockDatabase();
    const orderService = new OrderService(db);

    const order = generateMockOrder();

    const newOrder = await orderService.createOrder(order, user);

    expect(newOrder).toBeDefined();

    const orders = await orderService.getOrders();

    expect(orders).toBeDefined();
  });

  it("should not get all orders for a non existing user", async () => {
    const db = new MockDatabase();
    const orderService = new OrderService(db);

    const order = generateMockOrder();

    const _newOrder = await orderService.createOrder(order, user);

    try {
      await orderService.getOrders();
    } catch (error: unknown) {
      if (!(error instanceof Error)) {
        throw error;
      }

      expect(error.message).toBe("No orders found");
    }
  });

  it("should not create an order for an unauthenticated user", async () => {
    const db = new MockDatabase();
    const orderService = new OrderService(db);

    const order = generateMockOrder();

    try {
      await orderService.createOrder(order, 0);
    } catch (error: unknown) {
      if (!(error instanceof Error)) {
        throw error;
      }

      expect(error.message).toBe("There was an error creating your order");
    }
  });
});
