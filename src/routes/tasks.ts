import { Router } from "express";
import { Services } from "../services/serviceContainer.ts";
import { asyncHandler, createError } from "../utils/errorHandler.ts";
import { createUploadMiddleware } from "../utils/upload.ts";

export function createTaskRoutes(
  services: Services,
  uploadsDir: string,
): Router {
  const router = Router();
  const { taskService, jwtMiddleware } = services;
  const upload = createUploadMiddleware(uploadsDir);

  router.post(
    "/",
    upload.array("attachments"),
    jwtMiddleware.validateToken,
    asyncHandler(async (req, res) => {
      const { classId, title, description, dueDate } = JSON.parse(
        req.body.body,
      );
      const files = req.files as Express.Multer.File[];

      const newTask = await taskService.createTask(
        {
          classId: Number(classId),
          title,
          description,
          hasAttachment: files.length > 0,
          dueDate: new Date(dueDate),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        classId,
        req.user!.id,
        files,
      );

      res.status(201).json({
        classId: newTask?.classId,
        title: newTask?.title,
        description: newTask?.description,
        dueDate: newTask?.dueDate,
        id: newTask?.id,
      });
    }),
  );

  router.get(
    "/",
    jwtMiddleware.validateToken,
    asyncHandler(async (req, res) => {
      const tasks = await taskService.getAllTasksForUser(req.user!.id);
      res.status(200).json(tasks);
    }),
  );

  router.get(
    "/subject/:subjectId",
    jwtMiddleware.validateToken,
    asyncHandler(async (req, res) => {
      const subjectId = Number(req.params.subjectId);
      const tasks = await taskService.getTasksBySubjectId(subjectId);

      res.status(200).json(tasks.map((task) => ({
        id: task.id,
        classId: task.classId,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
      })));
    }),
  );

  router.get(
    "/:id",
    jwtMiddleware.validateToken,
    asyncHandler(async (req, res) => {
      const taskId = Number(req.params.id);
      const task = await taskService.getTaskById(taskId, req.user!.id);

      if (!task) {
        throw createError("Task not found", 404);
      }

      res.status(200).json({
        id: task.id,
        classId: task.classId,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        attachments: task.attachments,
      });
    }),
  );

  router.post(
    "/:id/submit",
    upload.array("attachments"),
    jwtMiddleware.validateToken,
    asyncHandler(async (req, res) => {
      const taskId = Number(req.params.id);
      const files = req.files as Express.Multer.File[];

      await taskService.submitTask(
        taskId,
        req.user!.id,
        files,
      );

      res.status(200).json({ message: "Submission successful" });
    }),
  );

  router.get(
    "/:id/submissions",
    jwtMiddleware.validateToken,
    asyncHandler(async (req, res) => {
      const taskId = Number(req.params.id);
      const submissions = await taskService.getTaskSubmissions(taskId);

      res.status(200).json(submissions);
    }),
  );

  router.post(
    "/:id/grade",
    jwtMiddleware.validateToken,
    asyncHandler(async (req, res) => {
      const submissionId = Number(req.params.id);
      const { grade } = req.body;

      await taskService.gradeSubmission(submissionId, grade, req.user!.id);

      res.status(200).json({ message: "Grading successful" });
    }),
  );

  return router;
}
