import { Router } from "express";
import { Services } from "../services/serviceContainer.ts";
import { asyncHandler } from "../utils/errorHandler.ts";

export function createEnrollmentRoutes(services: Services): Router {
  const router = Router();
  const { classService, jwtMiddleware } = services;

  router.post(
    "/",
    jwtMiddleware.validateToken,
    asyncHandler(async (req, res) => {
      const { studentId, classId } = req.body;

      const enrollment = await classService.enrollStudent(
        classId,
        studentId,
        req.user!.id,
      );

      res.status(201).json({
        id: enrollment.id,
        studentId: enrollment.studentId,
        classId: enrollment.classId,
      });
    }),
  );

  return router;
}
