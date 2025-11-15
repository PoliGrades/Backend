import { Router } from "express";
import { Services } from "../services/serviceContainer.ts";
import { asyncHandler } from "../utils/errorHandler.ts";

export function createUserRoutes(services: Services): Router {
  const router = Router();
  const { authenticationService, jwtMiddleware } = services;

  router.get(
    "/professors",
    jwtMiddleware.validateToken,
    asyncHandler(async (_req, res) => {
      const professors = await authenticationService.getUsersByRole(
        "PROFESSOR",
      );

      res.status(200).json(professors.map((professor) => ({
        id: professor.id,
        name: professor.name,
        email: professor.email,
        role: professor.role,
      })));
    }),
  );

  router.get(
    "/students",
    jwtMiddleware.validateToken,
    asyncHandler(async (_req, res) => {
      const students = await authenticationService.getUsersByRole("STUDENT");

      res.status(200).json(students.map((student) => ({
        id: student.id,
        name: student.name,
        email: student.email,
        role: student.role,
      })));
    }),
  );

  return router;
}
