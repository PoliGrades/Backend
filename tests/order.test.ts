import { expect } from "jsr:@std/expect/expect";
import { describe, it } from "jsr:@std/testing/bdd";
import { MockDatabase } from "../src/database/MockDatabase.ts";
import { IOrder } from "../src/interfaces/IOrder.ts";
import { generateMockOrder } from "../src/mocks/Order.ts";
import { generateMockPassword, generateMockUser } from "../src/mocks/User.ts";
import { AuthenticationService } from "../src/services/AuthenticationService.ts";
import { OrderService } from "../src/services/OrderService.ts";

describe("Order service", () => {
    it("should create a new order", async () => {
        const db = new MockDatabase();
        const authenticationService = new AuthenticationService(db);
        const orderService = new OrderService(db);

        const user = generateMockUser();
        const userPassword = generateMockPassword();

        const newUser = await authenticationService.registerUser(user, userPassword);

        const order = generateMockOrder();

        const newOrder = await orderService.createOrder(order, newUser);

        expect(newOrder).toBeDefined();
    });

    it("should get an existing order", async () => {
        const db = new MockDatabase();
        const authenticationService = new AuthenticationService(db);
        const orderService = new OrderService(db);

        const user = generateMockUser();
        const userPassword = generateMockPassword();

        const newUser = await authenticationService.registerUser(user, userPassword);

        const order = generateMockOrder();

        const newOrder = await orderService.createOrder(order, newUser);

        const retrievedOrder = await orderService.getOrder(newOrder);

        expect(retrievedOrder).toBeDefined();
    })

    it("should not get a non existing order", async () => {
        const db = new MockDatabase();
        const authenticationService = new AuthenticationService(db);
        const orderService = new OrderService(db);

        const user = generateMockUser();
        const userPassword = generateMockPassword();

        const newUser = await authenticationService.registerUser(user, userPassword);

        const order = generateMockOrder();

        const _newOrder = await orderService.createOrder(order, newUser);

        try {
            await orderService.getOrder(0);
        } catch (error: unknown) {
            if (!(error instanceof Error)) {
                throw error;
            }

            expect(error.message).toBe("Order not found")
        }
    })

    it("should update an existing order", async () => {
        const db = new MockDatabase();
        const authenticationService = new AuthenticationService(db);
        const orderService = new OrderService(db);

        const user = generateMockUser();
        const userPassword = generateMockPassword();

        const newUser = await authenticationService.registerUser(user, userPassword);

        const order = generateMockOrder();
        
        const newOrder = await orderService.createOrder(order, newUser);
        
        const order_2 = generateMockOrder();
        order_2.userId = newUser

        expect(newOrder).toBeDefined();

        const updatedOrder = await orderService.updateOrder(order_2 as Required<IOrder>, newOrder);

        expect(updatedOrder).toBeDefined();
    })
})