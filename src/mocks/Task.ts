import { Faker, pt_BR } from "@faker-js/faker";
import { ITask } from "../interfaces/ITask.ts";

export function generateMockTask(classId?: number): ITask {
  const faker = new Faker({
    locale: pt_BR,
  });

  return {
    id: faker.number.int({ min: 1, max: 1000 }),
    classId: classId || faker.number.int({ min: 1, max: 1000 }),
    title: faker.lorem.words(5),
    description: faker.lorem.sentence(),
    hasAttachment: faker.datatype.boolean(),
    dueDate: faker.date.future(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
