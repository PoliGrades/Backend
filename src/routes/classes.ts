import { Router } from "express";
import { Services } from "../services/serviceContainer.ts";
import { asyncHandler } from "../utils/errorHandler.ts";

export function createClassRoutes(services: Services): Router {
  const router = Router();
  const { classService, jwtMiddleware } = services;

  router.post(
    "/",
    jwtMiddleware.validateToken,
    asyncHandler(async (req, res) => {
      const { name, subjectId } = req.body;

      const newClassId = await classService.createClass(
        {
          name,
          subjectId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        req.user!.id,
        subjectId,
      );

      const newClass = await classService.getClassById(newClassId);

      res.status(201).json({
        name: newClass?.name,
        subjectId: newClass?.subjectId,
        id: newClass?.id,
      });
    }),
  );

  router.get(
    "/subject/:subjectId",
    jwtMiddleware.validateToken,
    asyncHandler(async (req, res) => {
      const subjectId = Number(req.params.subjectId);
      const classes = await classService.getClassesBySubjectId(subjectId);

      res.status(200).json(classes.map((classData) => ({
        id: classData.id,
        name: classData.name,
        subjectId: classData.subjectId,
      })));
    }),
  );

  return router;
}
