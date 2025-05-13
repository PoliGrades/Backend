import { Faker, pt_BR } from "@faker-js/faker";
import { IUser } from "../interfaces/IUser.ts";

export function generateMockUser(): IUser {
  const faker = new Faker({
    locale: pt_BR,
  });

  return {
    id: faker.number.int({ min: 1, max: 1000 }),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    document: faker.string.numeric(11),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };
}

export function generateMockPassword(): string {
  const faker = new Faker({
    locale: pt_BR,
  });

  return faker.internet.password({
    length: 8,
    memorable: true,
  });
}
