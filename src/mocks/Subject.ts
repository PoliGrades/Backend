import { Faker, pt_BR } from "@faker-js/faker";
import { ISubject } from "../interfaces/ISubject.ts";

export function generateMockSubject(): ISubject {
  const faker = new Faker({
    locale: pt_BR,
  });

  return {
    id: faker.number.int({ min: 1, max: 1000 }),
    name: faker.lorem.word(),
    description: faker.lorem.sentence(),
    color: faker.color.rgb({ prefix: "#" }),
    accentColor: faker.color.rgb({ prefix: "#" }),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }
}
