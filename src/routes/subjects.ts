import { Router } from "express";
import { Services } from "../services/serviceContainer.ts";
import { asyncHandler, createError } from "../utils/errorHandler.ts";

export function createSubjectRoutes(services: Services): Router {
  const router = Router();
  const { subjectService, jwtMiddleware } = services;

  router.post(
    "/",
    jwtMiddleware.validateToken,
    asyncHandler(async (req, res) => {
      const { name, description, color, accentColor } = req.body;

      const newSubjectId = await subjectService.createSubject({
        name,
        description,
        color,
        accentColor,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const newSubject = await subjectService.getSubjectById(newSubjectId);

      res.status(201).json({
        name: newSubject?.name,
        description: newSubject?.description,
        color: newSubject?.color,
        accentColor: newSubject?.accentColor,
        id: newSubject?.id,
      });
    }),
  );

  router.get(
    "/",
    jwtMiddleware.validateToken,
    asyncHandler(async (_req, res) => {
      const subjects = await subjectService.getAllSubjects();

      res.status(200).json(subjects.map((subject) => ({
        id: subject.id,
        name: subject.name,
        description: subject.description,
        color: subject.color,
        accentColor: subject.accentColor,
      })));
    }),
  );

  router.get(
    "/:id",
    jwtMiddleware.validateToken,
    asyncHandler(async (req, res) => {
      const subjectId = Number(req.params.id);
      const subject = await subjectService.getSubjectById(subjectId);

      if (!subject) {
        throw createError("Subject not found", 404);
      }

      res.status(200).json(subject);
    }),
  );

  return router;
}
