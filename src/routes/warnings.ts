import { Router } from "express";
import { IWarning } from "../interfaces/IWarning.ts";
import { Services } from "../services/serviceContainer.ts";
import { asyncHandler, createError } from "../utils/errorHandler.ts";

export function createWarningRoutes(services: Services): Router {
  const router = Router();
  const { warningService, subjectService, jwtMiddleware } = services;

  router.post(
    "/",
    jwtMiddleware.validateToken,
    asyncHandler(async (req, res) => {
      const { title, description, subjectId } = req.body;

      const subjectData = await subjectService.getSubjectById(subjectId);
      if (!subjectData) {
        throw createError("Subject not found", 404);
      }

      const warning: IWarning = {
        userID: req.user!.id,
        subjectId: subjectId,
        subjectName: subjectData.name,
        userName: req.user!.name,
        title: title,
        description: description,
        timestamp: new Date(),
      };

      await warningService.addWarning(warning);
      res.status(201).json(warning);
    }),
  );

  router.get(
    "/",
    jwtMiddleware.validateToken,
    asyncHandler(async (_req, res) => {
      const warnings = await warningService.getWarnings();
      res.status(200).json(warnings);
    }),
  );

  return router;
}
