import {
  submission as submissionTable,
  task as taskTable
} from "../database/schema.ts";
import { IDatabase } from "../interfaces/IDatabase.ts";
import { ISubmission } from "../interfaces/ISubmission.ts";
import { ISubmissionAttachment } from "../interfaces/ISubmissionAttachment.ts";
import { ITask } from "../interfaces/ITask.ts";
import { ITaskAttachment } from "../interfaces/ITaskAttachment.ts";
import { taskSchema } from "../schemas/zodSchema.ts";
import { ClassService } from "./ClassService.ts";
import { validateData } from "./decorators.ts";
import { SubmissionAttachmentService } from "./SubmissionAttachmentService.ts";
import { TaskAttachmentService } from "./TaskAttachmentService.ts";

export class TaskService {
  private db: IDatabase;
  private classService: ClassService;
  private taskAttachmentService?: TaskAttachmentService;
  private submissionAttachmentService?: SubmissionAttachmentService;

  constructor(
    db: IDatabase,
    classService?: ClassService,
    taskAttachmentService?: TaskAttachmentService,
    submissionAttachmentService?: SubmissionAttachmentService,
  ) {
    this.db = db;
    this.taskAttachmentService = taskAttachmentService;
    this.submissionAttachmentService = submissionAttachmentService;
    this.classService = classService || new ClassService(db);
  }

  @validateData(taskSchema)
  async createTask(
    taskData: Partial<ITask>,
    classId: number,
    userId: number,
    files?: Express.Multer.File[],
  ): Promise<ITask & { attachments: ITaskAttachment[] }> {
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

    if (files && files.length > 0) {
      for (const file of files) {
        await this.taskAttachmentService!.addTaskAttachment({
          taskId: newTaskId.id,
          fileName: file.originalname,
          filePath: file.path,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as ITaskAttachment);
      }
    }

    const createdTask = await this.db.select(taskTable, newTaskId.id);
    if (!createdTask) {
      throw new Error("There was an error creating your task");
    }

    if (!files || files.length === 0) {
      return {
        ...createdTask,
        attachments: [],
      };
    }

    const attachments = await this.taskAttachmentService!
      .getTaskAttachmentsByTaskId(newTaskId.id);

    return {
      ...createdTask,
      attachments: attachments,
    };
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

  async getTaskById(
    taskId: number,
    userId: number,
  ): Promise<ITask & { attachments: ITaskAttachment[] } | null> {
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

    let attachments: ITaskAttachment[] = [];

    if (task.hasAttachment && this.taskAttachmentService) {
      attachments = await this.taskAttachmentService.getTaskAttachmentsByTaskId(
        task.id,
      );
    }

    return {
      ...task,
      attachments: attachments,
    };
  }

  async getTasksBySubjectId(subjectId: number): Promise<ITask[]> {
    const classes = await this.classService.getClassesBySubjectId(
      subjectId,
    );

    const tasksPromises = classes.map((cls) =>
      this.db.selectByField(taskTable, "classId", cls.id)
    );
    const tasks = await Promise.all(tasksPromises);
    return tasks.flat();
  }

  async getAllTasksForUser(userId: number): Promise<ITask[]> {
    // Find all classes the user is enrolled in
    const enrolledClasses = await this.classService.getEnrollmentsByStudentId(
      userId,
    );

    const tasks: ITask[] = [];

    for (const cls of enrolledClasses) {
      const classTasks = await this.getTasksByClassId(cls.id, userId);
      tasks.push(...classTasks);
    }

    return tasks;
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

  async submitTask(
    taskId: number,
    studentId: number,
    attachments: Express.Multer.File[],
  ): Promise<ISubmission & { attachments: ISubmissionAttachment[] }> {
    const existingTask = await this.db.select(taskTable, taskId);

    if (!existingTask) {
      throw new Error("Task not found");
    }

    // const isEnrolled = await this.classService.isStudentEnrolled(
    //   existingTask.classId,
    //   studentId,
    // );

    // if (!isEnrolled) {
    //   throw new Error("Student is not enrolled in this class.");
    // }

    if (attachments && attachments.length > 0) {
      await this.submissionAttachmentService?.addSubmissionAttachment(
        {
          submissionId: taskId,
          fileName: attachments[0].originalname,
          filePath: attachments[0].path,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as ISubmissionAttachment,
      );
    }

    const newSubmission = await this.db.insert(submissionTable, {
      taskId,
      studentId,
      hasAttachment: attachments.length > 0,
      submittedAt: new Date(),
      graded: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const submissionData = await this.db.select(
      submissionTable,
      newSubmission.id,
    );
    if (!submissionData) {
      throw new Error("There was an error creating your submission");
    }

    const submittedAttachments = await this.submissionAttachmentService!
      .getSubmissionAttachmentsBySubmissionId(newSubmission.id);

    return {
      ...submissionData,
      attachments: submittedAttachments,
    };
  }

  async gradeSubmission(
    submissionId: number,
    grade: number,
    userId: number,
  ): Promise<void> {
    const submission = await this.db.select(submissionTable, submissionId);

    if (!submission) {
      throw new Error("Submission not found");
    }

    const task = await this.db.select(taskTable, submission.taskId);

    if (!task) {
      throw new Error("Task not found");
    }

    const classInfo = await this.classService.getClassById(task.classId);

    if (!classInfo || classInfo.ownerId !== userId) {
      throw new Error(
        "User does not have permission to grade this submission.",
      );
    }

    await this.db.update(submissionTable, submissionId, {
      graded: true,
      grade: grade,
      updatedAt: new Date(),
    } as any);
  }

  async getTaskSubmissions(taskId: number): Promise<ISubmission[]> {
    const submissions = await this.db.selectByField(submissionTable, "taskId", taskId);

    return submissions.map((submission) => ({
      id: submission.id,
      taskId: submission.taskId,
      studentId: submission.studentId,
      submittedAt: submission.submittedAt,
      graded: submission.graded,
      grade: submission.grade,
    } as ISubmission));
  }
}
