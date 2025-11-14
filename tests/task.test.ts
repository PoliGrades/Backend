import { expect } from "jsr:@std/expect/expect";
import { beforeAll, describe, it } from "jsr:@std/testing/bdd";
import { MockDatabase } from "../src/database/MockDatabase.ts";
import { generateMockClass } from "../src/mocks/Class.ts";
import { generateMockSubject } from "../src/mocks/Subject.ts";
import { generateMockTask } from "../src/mocks/Task.ts";
import { generateMockPassword, generateMockUser } from "../src/mocks/User.ts";
import { AuthenticationService } from "../src/services/AuthenticationService.ts";
import { ClassService } from "../src/services/ClassService.ts";
import { SubjectService } from "../src/services/SubjectService.ts";
import { TaskService } from "../src/services/TaskService.ts";

describe("Task service", () => {
  let userId: number;
  let db: MockDatabase;
  let classId: number;
  let invisibleClassId: number;
  let classService: ClassService;

  beforeAll(async () => {
    db = new MockDatabase();
    const authenticationService = new AuthenticationService(db);
    const subjectService = new SubjectService(db);

    const newUser = generateMockUser("PROFESSOR");
    const userPassword = generateMockPassword();

    userId = await authenticationService.registerUser(newUser, userPassword);

    const subjectId = await subjectService.createSubject(generateMockSubject());

    const classData = generateMockClass(userId);

    classService = new ClassService(db);
    classId = await classService.createClass(classData, userId, subjectId);
    invisibleClassId = await classService.createClass(
      generateMockClass(userId),
      userId,
      subjectId
    ); // Create a second class to test task visibility
  });

  it("should create a new task", async () => {
    const taskService = new TaskService(db, classService);
    const taskData = generateMockTask(classId);

    const newTask = await taskService.createTask(taskData, classId, userId);

    expect(newTask).toBeDefined();
    expect(newTask.classId).toBe(classId);
  });

  it("should not create a task for a class the user does not own", async () => {
    const taskService = new TaskService(db, classService);
    const taskData = generateMockTask(classId);

    await expect(
      taskService.createTask(taskData, classId, userId + 1),
    ).rejects.toThrow(
      "User does not have permission to create tasks in this class.",
    );
  });

  it("should not create a task with invalid data", async () => {
    const taskService = new TaskService(db, classService);
    const invalidTaskData = {
      title: "", // Invalid title
      description: "This is a test task",
      dueDate: new Date(),
    };

    await expect(
      taskService.createTask(invalidTaskData, classId, userId),
    ).rejects.toThrow();
  });

  it("should allow the student to view tasks in their enrolled classes", async () => {
    const authenticationService = new AuthenticationService(db);
    const studentUser = generateMockUser("STUDENT");
    const studentPassword = generateMockPassword();

    const studentId = await authenticationService.registerUser(
      studentUser,
      studentPassword,
    );

    await classService.enrollStudent(classId, studentId, userId);

    const taskService = new TaskService(db, classService);
    const taskData = generateMockTask(classId);

    const newTask = await taskService.createTask(taskData, classId, userId);

    const invisibleTask = await taskService.createTask(
      generateMockTask(),
      invisibleClassId,
      userId,
    );

    const allTasks = await taskService.getTasksByClassId(classId, studentId);

    expect(allTasks).toBeDefined();
    expect(allTasks.length).toBeGreaterThan(0);

    const taskIds = allTasks.map((task) => task.id);
    expect(taskIds).toContain(newTask.id);
    expect(taskIds).not.toContain(invisibleTask.id);
  });

  it("should allow the owner of the task to update it", async () => {
    const taskService = new TaskService(db, classService);
    const taskData = generateMockTask(classId);

    const newTask = await taskService.createTask(taskData, classId, userId);

    const updatedTitle = "Updated Task Title";
    const updatedTask = await taskService.updateTask(
      { title: updatedTitle },
      newTask.id,
      userId,
    );

    expect(updatedTask).toBeDefined();
    expect(updatedTask.title).toBe(updatedTitle);
  });

  it("should not allow a non-owner to update the task", async () => {
    const taskService = new TaskService(db, classService);
    const taskData = generateMockTask(classId);

    const newTask = await taskService.createTask(taskData, classId, userId);

    const updatedTitle = "Malicious Update Attempt";

    await expect(
      taskService.updateTask({ title: updatedTitle }, newTask.id, userId + 1),
    ).rejects.toThrow("User does not have permission to update this task.");
  });

  it("should allow the owner of the task to delete it", async () => {
    const taskService = new TaskService(db, classService);
    const taskData = generateMockTask(classId);

    const newTask = await taskService.createTask(taskData, classId, userId);

    await expect(
      taskService.deleteTask(newTask.id, userId),
    ).resolves.not.toThrow();

    const fetchedTask = await taskService.getTaskById(newTask.id, userId).catch(
      (e) => null,
    );
    expect(fetchedTask).toBeNull();
  });
});
