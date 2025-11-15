import { Faker, pt_BR } from "@faker-js/faker";
import { IClass } from "../interfaces/IClass.ts";

export function generateMockClass(
  ownerId?: number,
  subjectId?: number,
): IClass {
  const faker = new Faker({
    locale: pt_BR,
  });

  return {
    id: faker.number.int({ min: 1, max: 1000 }),
    name: faker.lorem.words(3),
    subjectId: subjectId ?? faker.number.int({ min: 1, max: 100 }),
    ownerId: ownerId ?? faker.number.int({ min: 1, max: 1000 }),
    ownerName: faker.person.fullName(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };
}
