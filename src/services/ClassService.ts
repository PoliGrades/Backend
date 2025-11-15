import {
  classTable,
  enrollment as enrollmentTable,
  user as userTable,
} from "../database/schema.ts";
import { IClass } from "../interfaces/IClass.ts";
import { IDatabase } from "../interfaces/IDatabase.ts";
import { IEnrollment } from "../interfaces/IEnrollment.ts";
import { classSchema } from "../schemas/zodSchema.ts";
import { validateData } from "./decorators.ts";

export class ClassService {
  private db: IDatabase;

  constructor(db: IDatabase) {
    this.db = db;
  }

  @validateData(classSchema)
  async createClass(
    classData: Partial<IClass>,
    userID: number,
    subjectId: number,
  ): Promise<number> {
    classData = {
      ...classData,
    };

    // Check if user is a professor
    const user = await this.db.selectByField(userTable, "id", userID);

    if (user.length === 0) {
      throw new Error("User not found");
    }

    if (user[0].role !== "PROFESSOR") {
      throw new Error("Only professors can create classes");
    }

    // Check if a class with the same name already exists for this professor
    const existingClasses = await this.db.selectByField(
      classTable,
      "name",
      classData.name!,
    );

    if (existingClasses.length > 0) {
      throw new Error("A class with this name already exists");
    }

    const newClass = await this.db.insert(classTable, {
      name: classData.name,
      subjectId: subjectId,
      ownerId: userID,
      ownerName: user[0].name,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as IClass);
    if (!newClass) {
      throw new Error("There was an error creating your class");
    }

    return newClass.id;
  }

  async getAllClasses(): Promise<IClass[]> {
    return await this.db.selectAll(classTable);
  }

  async getClassById(id: number): Promise<IClass | null> {
    const classes = await this.db.selectByField(classTable, "id", id);
    return classes.length > 0 ? classes[0] : null;
  }

  async getClassesByOwnerId(ownerId: number): Promise<IClass[]> {
    return await this.db.selectByField(classTable, "ownerId", ownerId);
  }

  async getClassesBySubjectId(
    subjectId: number,
  ): Promise<IClass[]> {
    return await this.db.selectByField(classTable, "subjectId", subjectId);
  }

  async updateClass(
    id: number,
    classData: Partial<IClass>,
    userId: number,
  ): Promise<void> {
    // Check if user is a professor
    const user = await this.db.selectByField(userTable, "id", userId);

    if (user.length === 0) {
      throw new Error("User not found");
    }

    if (user[0].role !== "PROFESSOR") {
      throw new Error("Only professors can update classes");
    }

    const existingClass = await this.db.select(classTable, id);
    if (!existingClass) {
      throw new Error("Class not found");
    }

    if (existingClass.ownerId !== userId) {
      throw new Error("You can only update your own classes");
    }

    await this.db.update(classTable, id, {
      ...existingClass,
      ...classData,
      updatedAt: new Date(),
    } as IClass);

    return;
  }

  async deleteClass(id: number, userId: number): Promise<void> {
    // Check if user is a professor
    const user = await this.db.selectByField(userTable, "id", userId);

    if (user.length === 0) {
      throw new Error("User not found");
    }

    if (user[0].role !== "PROFESSOR") {
      throw new Error("Only professors can delete classes");
    }

    const existingClass = await this.db.select(classTable, id);
    if (!existingClass) {
      throw new Error("Class not found");
    }

    if (existingClass.ownerId !== userId) {
      throw new Error("You can only delete your own classes");
    }

    await this.db.delete(classTable, id);
    return;
  }

  async enrollStudent(
    classId: number,
    studentId: number,
    userId: number,
  ): Promise<IEnrollment> {
    // Check if user is a professor
    const user = await this.db.selectByField(userTable, "id", userId);

    if (user.length === 0) {
      throw new Error("User not found");
    }

    if (user[0].role !== "PROFESSOR") {
      throw new Error("Only professors can enroll students");
    }

    const existingClass = await this.db.select(classTable, classId);
    if (!existingClass) {
      throw new Error("Class not found");
    }

    if (existingClass.ownerId !== userId) {
      throw new Error("You can only enroll students in your own classes");
    }

    // Check if student exists and is a student
    const student = await this.db.selectByField(userTable, "id", studentId);

    if (student.length === 0) {
      throw new Error("Student not found");
    }

    if (student[0].role !== "STUDENT") {
      throw new Error("Only students can be enrolled in classes");
    }

    // Enroll student
    const enrollmentId = await this.db.insert(enrollmentTable, {
      classId: classId,
      studentId: studentId,
      createdAt: new Date(),
    });

    if (!enrollmentId) {
      throw new Error("There was an error enrolling the student");
    }

    const enrollment = await this.db.select(enrollmentTable, enrollmentId.id);
    if (!enrollment) {
      throw new Error("Enrollment not found after creation");
    }

    return enrollment;
  }

  async getEnrollmentsByClassId(classId: number): Promise<IEnrollment[]> {
    return await this.db.selectByField(enrollmentTable, "classId", classId);
  }

  async getEnrollmentsByStudentId(studentId: number): Promise<IEnrollment[]> {
    return await this.db.selectByField(enrollmentTable, "studentId", studentId);
  }

  async withdrawEnrollment(
    enrollmentId: number,
    userId: number,
  ): Promise<void> {
    const existingEnrollment = await this.db.select(
      enrollmentTable,
      enrollmentId,
    );

    if (!existingEnrollment) {
      throw new Error("Enrollment not found");
    }

    const user = await this.db.selectByField(userTable, "id", userId);

    if (user.length === 0) {
      throw new Error("User not found");
    }

    // Check if user is a professor or the student themselves
    if (
      user[0].role !== "PROFESSOR" && existingEnrollment.studentId !== userId
    ) {
      throw new Error(
        "Only professors or the student can withdraw enrollments",
      );
    }

    const existingClass = await this.db.select(
      classTable,
      existingEnrollment.classId,
    );

    if (!existingClass) {
      throw new Error("Class not found");
    }

    // If user is a professor, check if they own the class
    if (user[0].role === "PROFESSOR" && existingClass.ownerId !== userId) {
      throw new Error(
        "You can only withdraw enrollments from your own classes",
      );
    }

    await this.db.delete(enrollmentTable, enrollmentId);
    return;
  }

  async isStudentEnrolled(
    classId: number,
    studentId: number,
  ): Promise<boolean> {
    const enrollments = await this.db.selectByField(
      enrollmentTable,
      "classId",
      classId,
    );

    return enrollments.some((enrollment) => enrollment.studentId === studentId);
  }
}
