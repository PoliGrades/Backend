import { expect } from "jsr:@std/expect/expect";
import { beforeAll, describe, it } from "jsr:@std/testing/bdd";
import { MockDatabase } from "../src/database/MockDatabase.ts";
import { IClass } from "../src/interfaces/IClass.ts";
import { generateMockClass } from "../src/mocks/Class.ts";
import { generateMockSubject } from "../src/mocks/Subject.ts";
import { generateMockPassword, generateMockUser } from "../src/mocks/User.ts";
import { AuthenticationService } from "../src/services/AuthenticationService.ts";
import { ClassService } from "../src/services/ClassService.ts";
import { SubjectService } from "../src/services/SubjectService.ts";

describe("Class service", () => {
  let user: number;
  let db: MockDatabase;

  let subjectId: number;

  beforeAll(async () => {
    db = new MockDatabase();
    const authenticationService = new AuthenticationService(db);
    const subjectService = new SubjectService(db);

    // Create a subject for the classes
    subjectId = await subjectService.createSubject(generateMockSubject());

    const newUser = generateMockUser("PROFESSOR");
    const userPassword = generateMockPassword();

    user = await authenticationService.registerUser(newUser, userPassword);
  });

  it("should create a new class", async () => {
    const classService = new ClassService(db);

    const classData = generateMockClass();

    const newClass = await classService.createClass(classData, user, subjectId);

    expect(newClass).toBeDefined();
  });

  it("should not allow a student to create a class", async () => {
    const classService = new ClassService(db);

    const classData = generateMockClass();

    const studentUser = generateMockUser("STUDENT");
    const studentPassword = generateMockPassword();

    const authenticationService = new AuthenticationService(db);
    const student_user = await authenticationService.registerUser(
      studentUser,
      studentPassword,
    );

    await expect(classService.createClass(classData, student_user, subjectId)).rejects
      .toThrow(
        "Only professors can create classes",
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
    const newClass = await classService.createClass(classData, user, subjectId);

    const retrievedClass = await classService.getClassById(newClass);

    expect(retrievedClass).toBeDefined();
    expect(retrievedClass!.id).toBe(newClass);
  });

  it("should retrieve classes by owner ID", async () => {
    const classService = new ClassService(db);

    const classData = generateMockClass();
    await classService.createClass(classData, user, subjectId);

    const classes = await classService.getClassesByOwnerId(user);

    expect(classes).toBeDefined();
    expect(Array.isArray(classes)).toBe(true);
    expect(classes.length).toBeGreaterThan(0);
    expect(classes[0].ownerId).toBe(user);
  });

  it("should not allow updating a class by a non-professor", async () => {
    const classService = new ClassService(db);

    const classData = generateMockClass();
    const newClass = await classService.createClass(classData, user, subjectId);

    const studentUser = generateMockUser("STUDENT");
    const studentPassword = generateMockPassword();

    const authenticationService = new AuthenticationService(db);
    const student_user = await authenticationService.registerUser(
      studentUser,
      studentPassword,
    );

    await expect(classService.updateClass(newClass, classData, student_user))
      .rejects.toThrow(
        "Only professors can update classes",
      );
  });

  it("should update a class", async () => {
    const classService = new ClassService(db);

    const classData = generateMockClass(user);
    const newClass = await classService.createClass(classData, user, subjectId);

    const updatedClassData: Partial<IClass> = {
      name: "Updated Class Name",
    };

    await classService.updateClass(newClass, updatedClassData, user);

    const updatedClass = await classService.getClassById(newClass);
    expect(updatedClass).toBeDefined();
    expect(updatedClass!.name).toBe("Updated Class Name");
  });

  it("should delete a class", async () => {
    const classService = new ClassService(db);

    const classData = generateMockClass(user);
    const newClass = await classService.createClass(classData, user, subjectId);

    await classService.deleteClass(newClass, user);

    const deletedClass = await classService.getClassById(newClass);
    expect(deletedClass).toBeNull();
  });

  it("should not allow a student to delete a class", async () => {
    const classService = new ClassService(db);

    const classData = generateMockClass();
    const newClass = await classService.createClass(classData, user, subjectId);

    const studentUser = generateMockUser("STUDENT");
    const studentPassword = generateMockPassword();

    const authenticationService = new AuthenticationService(db);
    const student_user = await authenticationService.registerUser(
      studentUser,
      studentPassword,
    );

    await expect(classService.deleteClass(newClass, student_user)).rejects
      .toThrow(
        "Only professors can delete classes",
      );
  });

  it("should enroll a student in a class", async () => {
    const classService = new ClassService(db);
    const authenticationService = new AuthenticationService(db);
    const studentUser = generateMockUser("STUDENT");
    const studentPassword = generateMockPassword();

    const student_user = await authenticationService.registerUser(
      studentUser,
      studentPassword,
    );

    const classData = generateMockClass();
    const newClass = await classService.createClass(classData, user, subjectId);

    const enrollment = await classService.enrollStudent(
      newClass,
      student_user,
      user,
    );

    expect(enrollment).toBeDefined();
    expect(enrollment.classId).toBe(newClass);
    expect(enrollment.studentId).toBe(student_user);
  });

  it("should not allow a student to enroll another student", async () => {
    const classService = new ClassService(db);
    const authenticationService = new AuthenticationService(db);
    const studentUser1 = generateMockUser("STUDENT");
    const studentPassword1 = generateMockPassword();

    const student_user1 = await authenticationService.registerUser(
      studentUser1,
      studentPassword1,
    );

    const studentUser2 = generateMockUser("STUDENT");
    const studentPassword2 = generateMockPassword();

    const student_user2 = await authenticationService.registerUser(
      studentUser2,
      studentPassword2,
    );

    const classData = generateMockClass();
    const newClass = await classService.createClass(classData, user, subjectId);

    await expect(
      classService.enrollStudent(newClass, student_user2, student_user1),
    ).rejects.toThrow("Only professors can enroll students");
  });

  it("should allow the user to withdraw himself from a class", async () => {
    const classService = new ClassService(db);
    const authenticationService = new AuthenticationService(db);
    const studentUser = generateMockUser("STUDENT");
    const studentPassword = generateMockPassword();

    const student_user = await authenticationService.registerUser(
      studentUser,
      studentPassword,
    );

    const classData = generateMockClass();
    const newClass = await classService.createClass(classData, user, subjectId);

    const enrollment = await classService.enrollStudent(
      newClass,
      student_user,
      user,
    );

    expect(enrollment).toBeDefined();
    expect(enrollment.classId).toBe(newClass);
    expect(enrollment.studentId).toBe(student_user);

    await classService.withdrawEnrollment(enrollment.id, student_user);

    const enrollments = await classService.getEnrollmentsByStudentId(
      student_user,
    );
    expect(enrollments.find((e) => e.id === enrollment.id)).toBeUndefined();
  });

  it("should allow a professor to withdraw a student from a class", async () => {
    const classService = new ClassService(db);
    const authenticationService = new AuthenticationService(db);
    const studentUser = generateMockUser("STUDENT");
    const studentPassword = generateMockPassword();

    const student_user = await authenticationService.registerUser(
      studentUser,
      studentPassword,
    );

    const classData = generateMockClass();
    const newClass = await classService.createClass(classData, user, subjectId);

    const enrollment = await classService.enrollStudent(
      newClass,
      student_user,
      user,
    );

    expect(enrollment).toBeDefined();
    expect(enrollment.classId).toBe(newClass);
    expect(enrollment.studentId).toBe(student_user);

    await classService.withdrawEnrollment(enrollment.id, user);

    const enrollments = await classService.getEnrollmentsByStudentId(
      student_user,
    );
    expect(enrollments.find((e) => e.id === enrollment.id)).toBeUndefined();
  });
});
