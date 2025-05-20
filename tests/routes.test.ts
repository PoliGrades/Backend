import { expect } from "jsr:@std/expect/expect";
import { beforeAll, describe, it } from "jsr:@std/testing/bdd";
import request from "supertest";
import { wsServer } from "../src/main.ts";
import { generateMockOrder } from "../src/mocks/Order.ts";
import { generateMockPassword, generateMockUser } from "../src/mocks/User.ts";

describe("Routes", () => {
  describe("POST /auth/register", () => {
  it("should register a new user", async () => {
    const newUser = generateMockUser();
    const password = generateMockPassword();

    const res = await request(wsServer)
      .post("/auth/register")
      .send({
        name: newUser.name,
        email: newUser.email,
        document: newUser.document,
        password: password,
      });

    expect(res.status).toBe(201);
  });

  it("should not register a user with an existing email", async () => {
    const newUser = generateMockUser();
    const password = generateMockPassword();

    await request(wsServer)
      .post("/auth/register")
      .send({
        name: newUser.name,
        email: newUser.email,
        document: newUser.document,
        password: password,
      });

    const res = await request(wsServer)
      .post("/auth/register")
      .send({
        name: newUser.name,
        email: newUser.email,
        document: newUser.document,
        password: password,
      });

    expect(res.status).toBe(400);
  });

  it("should not register a user with missing fields", async () => {
    const res = await request(wsServer)
      .post("/auth/register")
      .send({
        name: "John Doe",
        email: "test@test.com",
        document: "12345678901",
      });
    expect(res.status).toBe(400);
  });
});

describe("POST /auth/login", () => {
  it("should login a user with valid credentials", async () => {
    const newUser = generateMockUser();
    const password = generateMockPassword();

    await request(wsServer)
      .post("/auth/register")
      .send({
        name: newUser.name,
        email: newUser.email,
        document: newUser.document,
        password: password,
      });

    const res = await request(wsServer)
      .post("/auth/login")
      .send({
        email: newUser.email,
        password: password,
      });

    expect(res.status).toBe(200);
  });

  it("should not login a user with invalid credentials", async () => {
    const newUser = generateMockUser();
    const password = generateMockPassword();

    await request(wsServer)
      .post("/auth/register")
      .send({
        name: newUser.name,
        email: newUser.email,
        document: newUser.document,
        password: password,
      });

    const res = await request(wsServer)
      .post("/auth/login")
      .send({
        email: newUser.email,
        password: "wrongpassword",
      });
    expect(res.status).toBe(401);
  });

  it("should be able to see hidden content with a valid JWT", async () => {
    const newUser = generateMockUser();
    const password = generateMockPassword();

    await request(wsServer)
      .post("/auth/register")
      .send({
        name: newUser.name,
        email: newUser.email,
        document: newUser.document,
        password: password,
      });

    const loginRes = await request(wsServer)
      .post("/auth/login")
      .send({
        email: newUser.email,
        password: password,
      });

    const token = loginRes.headers["set-cookie"][0].split("=")[1].split(";")[0];

    const res = await request(wsServer)
      .get("/hidden")
      .set("Cookie", `token=${token}`);

    expect(res.status).toBe(200);
  });

  it("should not be able to see hidden content without a valid JWT", async () => {
    const res = await request(wsServer)
      .get("/hidden");

    expect(res.status).toBe(401);
  });
});
describe("POST /order", () => {
  let token: string;

  beforeAll(async () => {
    const newUser = generateMockUser();
    const password = generateMockPassword();

    await request(wsServer)
      .post("/auth/register")
      .send({
        name: newUser.name,
        email: newUser.email,
        document: newUser.document,
        password: password,
      }).then((res) => {
        token = res.headers["set-cookie"][0].split("=")[1].split(";")[0];
      })
  });

  it("should create a new order", async () => {
    const res = await request(wsServer)
      .post("/order")
      .set("Cookie", `token=${token}`)
      .send(generateMockOrder());

    expect(res.status).toBe(201);
  });

  it("should update an existing order", async () => {
    const order = generateMockOrder();
    const createRes = await request(wsServer)
      .post("/order")
      .set("Cookie", `token=${token}`)
      .send(order);

    const orderId = createRes.body.data;
    const updatedOrder = generateMockOrder();
    const res = await request(wsServer)
      .put(`/order/${orderId}`)
      .set("Cookie", `token=${token}`)
      .send(updatedOrder);

    expect(res.status).toBe(200);
  });

  it("should not create a new order without a valid JWT", async () => {
    const res = await request(wsServer)
      .post("/order")
      .send(generateMockOrder());

    expect(res.status).toBe(401);
  });

  it("should not create a new order with invalid data", async () => {
    const res = await request(wsServer)
      .post("/order")
      .set("Cookie", `token=${token}`)
      .send({
        items: [
          {
            name: "Invalid Item",
            quantity: 2,
          },
        ],
      });

    expect(res.status).toBe(400);
  });
})
})
