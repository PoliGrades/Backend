import { faker } from "@faker-js/faker";
import { IOrder, IOrderItem } from "../interfaces/IOrder.ts";

export function generateMockOrder(): Partial<IOrder> {
  const orderItems = faker.helpers.multiple<IOrderItem>(() => {
    return {
      id: faker.number.int(),
      name: faker.food.dish(),
      quantity: faker.number.int({ min: 1, max: 5 }),
      price: faker.number.float({ min: 10.0, max: 50.0 }),
      observation: faker.lorem.sentence(),
    };
  });

  return {
    id: faker.number.int({ min: 1, max: 1000 }),
    status: faker.helpers.arrayElement([
      "pending",
      "completed",
      "canceled",
      "paid",
    ]),
    items: orderItems,
    paymentMethod: faker.helpers.arrayElement([
      "credit_card",
      "debit_card",
      "pix",
      "cash",
    ]),
    total: orderItems.reduce((total, cur) => total + cur.price, 0),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.future(),
  };
}
