import { Faker, pt_BR } from "@faker-js/faker";
import { stringify } from "jsr:@std/csv";
import { IUser } from "../interfaces/IUser.ts";

export function generateMockUser(role?: "STUDENT" | "PROFESSOR"): IUser {
  const faker = new Faker({
    locale: pt_BR,
  });

  return {
    id: faker.number.int({ min: 1, max: 1000 }),
    name: faker.person.fullName(),
    email: faker.internet.email({
      provider: "p4ed.com.br",
    }),
    role: role ?? faker.helpers.arrayElement(["STUDENT", "PROFESSOR"]),
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

export function generateMockCSV(numUsers: number, location?: string): string {
  const users = [];

  for (let i = 0; i < numUsers; i++) {
    const user = generateMockUser("STUDENT");
    const password = generateMockPassword();
  
    users.push({ ...user, password });
  }

  const csvData = stringify(users, { columns: ["name", "email", "role", "password"] });
  
  if (location) {
    Deno.writeTextFileSync(location, csvData);
  }

  return csvData
}