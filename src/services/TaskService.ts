import { task as taskTable } from "../database/schema.ts";
import { IDatabase } from "../interfaces/IDatabase.ts";
import { ITask } from "../interfaces/ITask.ts";
import { taskSchema } from "../schemas/zodSchema.ts";
import { ClassService } from "./ClassService.ts";
import { validateData } from "./decorators.ts";

export class TaskService {
  private db: IDatabase;
  private classService: ClassService;

  constructor(db: IDatabase, classService?: ClassService) {
    this.db = db;
    this.classService = classService || new ClassService(db);
  }

  @validateData(taskSchema)
  async createTask(
    taskData: Partial<ITask>,
    classId: number,
    userId: number,
  ): Promise<ITask> {
    // Verify if the user has permission to create a task in the specified class
    const classInfo = await this.classService.getClassById(classId);

    if (!classInfo || classInfo.ownerId !== userId) {
      throw new Error(
        "User does not have permission to create tasks in this class.",
      );
    }

    // Insert the new task into the database
    const newTaskId = await this.db.insert(taskTable, {
      ...taskData,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as ITask);

    const createdTask = await this.db.select(taskTable, newTaskId.id);
    if (!createdTask) {
      throw new Error("There was an error creating your task");
    }

    return createdTask;
  }

  async getTasksByClassId(
    classId: number,
    studentId: number,
  ): Promise<ITask[]> {
    // Verify if the student is enrolled in the class
    const isEnrolled = await this.classService.isStudentEnrolled(
      classId,
      studentId,
    );

    if (!isEnrolled) {
      throw new Error("Student is not enrolled in this class.");
    }

    // Fetch tasks for the specified class
    const tasks = await this.db.selectByField(taskTable, "classId", classId);
    return tasks;
  }

  async getTaskById(taskId: number, userId: number): Promise<ITask | null> {
    const task = await this.db.select(taskTable, taskId);

    if (!task) {
      return null;
    }

    const classInfo = await this.classService.getClassById(task.classId);

    if (
      !classInfo ||
      (classInfo.ownerId !== userId &&
        !(await this.classService.isStudentEnrolled(classInfo.id, userId)))
    ) {
      throw new Error("User does not have permission to view this task.");
    }

    return task;
  }

  async updateTask(
    taskData: Partial<ITask>,
    taskId: number,
    userId: number,
  ): Promise<ITask> {
    const existingTask = await this.db.select(taskTable, taskId);

    if (!existingTask) {
      throw new Error("Task not found");
    }

    const classInfo = await this.classService.getClassById(
      existingTask.classId,
    );

    if (!classInfo || classInfo.ownerId !== userId) {
      throw new Error("User does not have permission to update this task.");
    }

    const updatedTaskId = await this.db.update(taskTable, taskId, {
      ...taskData,
      updatedAt: new Date(),
    } as ITask);

    const updatedTask = await this.db.select(taskTable, updatedTaskId.id);
    if (!updatedTask) {
      throw new Error("There was an error updating your task");
    }

    return updatedTask;
  }

  async deleteTask(taskId: number, userId: number): Promise<void> {
    const existingTask = await this.db.select(taskTable, taskId);

    if (!existingTask) {
      throw new Error("Task not found");
    }

    const classInfo = await this.classService.getClassById(
      existingTask.classId,
    );

    if (!classInfo || classInfo.ownerId !== userId) {
      throw new Error("User does not have permission to delete this task.");
    }

    await this.db.delete(taskTable, taskId);
  }
}
