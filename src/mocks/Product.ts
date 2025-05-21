import { faker } from "@faker-js/faker";
import { IProduct } from "../interfaces/IProduct.ts";

export function generateMockProduct(): Partial<IProduct> {
  return {
    name: faker.food.dish(),
    description: faker.food.description(),
    price: faker.number.float({ min: 10.0, max: 50.0 }),
    available: true,
    createdAt: faker.date.recent(),
    updatedAt: faker.date.future(),
  };
}
