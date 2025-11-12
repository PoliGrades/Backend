import { grade as gradeTable } from "../database/schema.ts";
import { IDatabase } from "../interfaces/IDatabase.ts";
import { IGrade } from "../interfaces/IGrade.ts";
import { ClassService } from "./ClassService.ts";
import { TaskService } from "./TaskService.ts";

export class GradeService {
  private db: IDatabase;
  private taskService: TaskService;
  private classService: ClassService;

  constructor(
    db: IDatabase,
    classService: ClassService,
    taskService?: TaskService,
  ) {
    this.db = db;
    this.classService = classService;
    this.taskService = taskService || new TaskService(db, classService);
  }

  async assignGrade(
    taskId: number,
    studentId: number,
    userId: number,
    gradeValue: number,
  ): Promise<IGrade> {
    // Validate task existence and ownership
    const task = await this.taskService.getTaskById(taskId, userId);

    if (!task) {
      throw new Error(
        "Task not found or you do not have permission to grade this task.",
      );
    }

    // Check if the student is enrolled in the class
    const enrollment = await this.classService.isStudentEnrolled(
      task.classId,
      studentId,
    );

    if (!enrollment) {
      throw new Error("Student is not enrolled in the class.");
    }

    // Assign grade
    const newGradeId = await this.db.insert(gradeTable, {
      taskId,
      studentId,
      grade: gradeValue.toString(),
    });

    const newGrade = await this.db.select(gradeTable, newGradeId.id);
    if (!newGrade) {
      throw new Error("Failed to assign grade.");
    }

    return newGrade;
  }

  async getGradesByStudent(
    studentId: number,
    userId: number,
  ): Promise<IGrade[]> {
    // Ensure the user is requesting their own grades
    if (studentId !== userId) {
      throw new Error("You can only view your own grades.");
    }

    const grades = await this.db.selectByField(
      gradeTable,
      "studentId",
      studentId,
    );
    return grades;
  }

  async updateGrade(
    gradeId: number,
    userId: number,
    newGradeValue: number,
  ): Promise<IGrade> {
    const existingGrade = await this.db.select(gradeTable, gradeId);

    if (!existingGrade) {
      throw new Error("Grade not found.");
    }

    // Validate task existence and ownership
    const task = await this.taskService.getTaskById(
      existingGrade.taskId,
      userId,
    );

    if (!task) {
      throw new Error(
        "Task not found or you do not have permission to update this grade.",
      );
    }

    // Update grade
    await this.db.update(gradeTable, gradeId, {
      grade: newGradeValue.toString(),
    });

    const updatedGrade = await this.db.select(gradeTable, gradeId);
    if (!updatedGrade) {
      throw new Error("Failed to update grade.");
    }

    return updatedGrade;
  }

  async unassignGrade(gradeId: number, userId: number): Promise<void> {
    const existingGrade = await this.db.select(gradeTable, gradeId);

    if (!existingGrade) {
      throw new Error("Grade not found.");
    }

    // Validate task existence and ownership
    const task = await this.taskService.getTaskById(
      existingGrade.taskId,
      userId,
    );

    if (!task) {
      throw new Error(
        "Task not found or you do not have permission to unassign this grade.",
      );
    }

    await this.db.delete(gradeTable, gradeId);
  }
}
