import { expect } from "jsr:@std/expect/expect";
import { beforeAll, describe, it } from "jsr:@std/testing/bdd";
import { MockDatabase } from "../src/database/MockDatabase.ts";
import { generateMockClass } from "../src/mocks/Class.ts";
import { generateMockTask } from "../src/mocks/Task.ts";
import { generateMockPassword, generateMockUser } from "../src/mocks/User.ts";
import { AuthenticationService } from "../src/services/AuthenticationService.ts";
import { ClassService } from "../src/services/ClassService.ts";
import { GradeService } from "../src/services/GradeService.ts";
import { TaskService } from "../src/services/TaskService.ts";

describe("Task service", () => {
  let db: MockDatabase;

  let classService: ClassService;
  let taskService: TaskService;
  let gradeService: GradeService;

  let professorId: number;
  let studentId: number;

  const tasksIds: number[] = [];

  beforeAll(async () => {
    db = new MockDatabase();
    const authenticationService = new AuthenticationService(db);

    const newUser = generateMockUser("PROFESSOR");
    const userPassword = generateMockPassword();

    professorId = await authenticationService.registerUser(
      newUser,
      userPassword,
    );

    const classData = generateMockClass(professorId);

    classService = new ClassService(db);

    const classId = await classService.createClass(classData, professorId);

    taskService = new TaskService(db, classService);
    gradeService = new GradeService(db, classService, taskService);

    const studentUser = generateMockUser("STUDENT");
    const studentPassword = generateMockPassword();

    studentId = await authenticationService.registerUser(
      studentUser,
      studentPassword,
    );

    await classService.enrollStudent(classId, studentId, professorId);

    // Create initial tasks
    for (let i = 0; i < 5; i++) {
      const taskData = generateMockTask(classId);
      const newTask = await taskService.createTask(
        taskData,
        classId,
        professorId,
      );

      tasksIds.push(newTask.id);
    }
  });

  it("should allow the professor to assign a grade to a student", async () => {
    const grade = await gradeService.assignGrade(
      tasksIds[0],
      studentId,
      professorId,
      9.5,
    );

    if (!grade) {
      throw new Error("Grade was not assigned.");
    }

    expect(grade).toBeDefined();
    expect(grade.taskId).toBe(tasksIds[0]);
    expect(grade.studentId).toBe(studentId);
    expect(grade.grade).toBe("9.5");
  });

  it("should not allow assigning a grade to a non-existent task", async () => {
    let errorCaught = false;
    try {
      await gradeService.assignGrade(9999, studentId, professorId, 8.0);
    } catch (error) {
      errorCaught = true;
      expect((error as Error).message).toBe(
        "Task not found or you do not have permission to grade this task.",
      );
    }
    expect(errorCaught).toBe(true);
  });

  it("should not allow the user to assign a grade if they are not the professor of the class", async () => {
    const anotherUser = generateMockUser("PROFESSOR");
    const anotherPassword = generateMockPassword();

    const authenticationService = new AuthenticationService(db);
    const anotherProfessorId = await authenticationService.registerUser(
      anotherUser,
      anotherPassword,
    );

    let errorCaught = false;
    try {
      await gradeService.assignGrade(
        tasksIds[1],
        studentId,
        anotherProfessorId,
        7.0,
      );
    } catch (error) {
      errorCaught = true;
      expect((error as Error).message).toBe(
        "User does not have permission to view this task.",
      );
    }
    expect(errorCaught).toBe(true);
  });

  it("should not allow assigning a grade to a student not enrolled in the class", async () => {
    const anotherStudent = generateMockUser("STUDENT");
    const anotherPassword = generateMockPassword();

    const authenticationService = new AuthenticationService(db);
    const anotherStudentId = await authenticationService.registerUser(
      anotherStudent,
      anotherPassword,
    );

    let errorCaught = false;
    try {
      await gradeService.assignGrade(
        tasksIds[2],
        anotherStudentId,
        professorId,
        6.0,
      );
    } catch (error) {
      errorCaught = true;
      expect((error as Error).message).toBe(
        "Student is not enrolled in the class.",
      );
    }

    expect(errorCaught).toBe(true);
  });

  it("should retrieve all grades for a student", async () => {
    // Assign multiple grades to the student
    await gradeService.assignGrade(tasksIds[3], studentId, professorId, 8.5);
    await gradeService.assignGrade(tasksIds[4], studentId, professorId, 10.0);

    const grades = await gradeService.getGradesByStudent(studentId, studentId);

    expect(grades).toBeDefined();
    expect(grades.length).toBe(3);

    const gradeValues = grades.map((g) => g.grade);
    expect(gradeValues).toContain("9.5");
    expect(gradeValues).toContain("8.5");
    expect(gradeValues).toContain("10");
  });

  it("should not allow a student to retrieve another student's grades", async () => {
    const anotherStudent = generateMockUser("STUDENT");
    const anotherPassword = generateMockPassword();

    const authenticationService = new AuthenticationService(db);
    const anotherStudentId = await authenticationService.registerUser(
      anotherStudent,
      anotherPassword,
    );

    let errorCaught = false;
    try {
      await gradeService.getGradesByStudent(studentId, anotherStudentId);
    } catch (error) {
      errorCaught = true;
      expect((error as Error).message).toBe(
        "You can only view your own grades.",
      );
    }

    expect(errorCaught).toBe(true);
  });

  it("should allow the professor to update a grade", async () => {
    // Assign a grade to be updated
    const grade = await gradeService.assignGrade(
      tasksIds[0],
      studentId,
      professorId,
      7.0,
    );

    if (!grade) {
      throw new Error("Grade was not assigned.");
    }

    // Update the grade
    const updatedGrade = await gradeService.updateGrade(
      grade.id,
      professorId,
      9,
    );

    expect(updatedGrade).toBeDefined();
    expect(updatedGrade.id).toBe(grade.id);
    expect(updatedGrade.grade).toBe("9");
  });

  it("should allow the professor to unassign a grade", async () => {
    // Assign a grade to be deleted
    const grade = await gradeService.assignGrade(
      tasksIds[1],
      studentId,
      professorId,
      6.0,
    );

    if (!grade) {
      throw new Error("Grade was not assigned.");
    }

    // Unassign the grade
    await gradeService.unassignGrade(grade.id, professorId);

    // Try to retrieve the deleted grade
    let errorCaught = false;
    try {
      await gradeService.updateGrade(grade.id, professorId, 8);
    } catch (error) {
      errorCaught = true;
      expect((error as Error).message).toBe("Grade not found.");
    }
    expect(errorCaught).toBe(true);
  });
});
