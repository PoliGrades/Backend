import { expect } from "jsr:@std/expect/expect";
import { beforeAll, describe, it } from "jsr:@std/testing/bdd";
import { MockDatabase } from "../src/database/MockDatabase.ts";
import { IClass } from "../src/interfaces/IClass.ts";
import { generateMockClass } from "../src/mocks/Class.ts";
import { generateMockPassword, generateMockUser } from "../src/mocks/User.ts";
import { AuthenticationService } from "../src/services/AuthenticationService.ts";
import { ClassService } from "../src/services/ClassService.ts";

describe("Class service", () => {
  let user: number;
  let db: MockDatabase;

  beforeAll(async () => {
    db = new MockDatabase();
    const authenticationService = new AuthenticationService(db);

    const newUser = generateMockUser("PROFESSOR");
    const userPassword = generateMockPassword();

    user = await authenticationService.registerUser(newUser, userPassword);
    console.log(user);
  });

  it("should create a new class", async () => {
    const classService = new ClassService(db);

    const classData = generateMockClass();

    const newClass = await classService.createClass(classData, user);

    expect(newClass).toBeDefined();
  });

  it("should not allow a student to create a class", async () => {
    const classService = new ClassService(db);

    const classData = generateMockClass();

    const studentUser = generateMockUser("STUDENT");
    const studentPassword = generateMockPassword();

    const authenticationService = new AuthenticationService(db);    
    const student_user = await authenticationService.registerUser(studentUser, studentPassword);

    await expect(classService.createClass(classData, student_user)).rejects.toThrow(
      "Only professors can create classes"
    );
  });

  it("should retrieve all classes", async () => {
    const classService = new ClassService(db);

    const classes = await classService.getAllClasses();

    expect(classes).toBeDefined();
    expect(Array.isArray(classes)).toBe(true);
  });

  it("should retrieve a class by ID", async () => {
    const classService = new ClassService(db);

    const classData = generateMockClass();
    const newClass = await classService.createClass(classData, user);

    const retrievedClass = await classService.getClassById(newClass);

    expect(retrievedClass).toBeDefined();
    expect(retrievedClass!.id).toBe(newClass);
  });

  it("should retrieve classes by owner ID", async () => {
    const classService = new ClassService(db);

    const classData = generateMockClass();
    await classService.createClass(classData, user);

    const classes = await classService.getClassesByOwnerId(user);

    expect(classes).toBeDefined();
    expect(Array.isArray(classes)).toBe(true);
    expect(classes.length).toBeGreaterThan(0);
    expect(classes[0].ownerId).toBe(user);
    });

    it("should not allow updating a class by a non-professor", async () => {
      const classService = new ClassService(db);

      const classData = generateMockClass();
      const newClass = await classService.createClass(classData, user);

      const studentUser = generateMockUser("STUDENT");
      const studentPassword = generateMockPassword();

      const authenticationService = new AuthenticationService(db);
      const student_user = await authenticationService.registerUser(studentUser, studentPassword);

      await expect(classService.updateClass(newClass, classData, student_user)).rejects.toThrow(
        "Only professors can update classes"
      );
    });

    it("should update a class", async () => {
      const classService = new ClassService(db);

      const classData = generateMockClass(user);
      const newClass = await classService.createClass(classData, user);

      const updatedClassData: Partial<IClass> = {
        name: "Updated Class Name",
      };

      await classService.updateClass(newClass, updatedClassData, user);

      const updatedClass = await classService.getClassById(newClass);
      expect(updatedClass).toBeDefined();
      expect(updatedClass!.name).toBe("Updated Class Name");
    });
});