import { Router } from "express";
import z from "zod";
import { userSchema } from "../schemas/zodSchema.ts";
import { Services } from "../services/serviceContainer.ts";
import { asyncHandler, createError } from "../utils/errorHandler.ts";

export function createAuthRoutes(services: Services): Router {
  const router = Router();
  const { authenticationService } = services;

  router.post(
    "/register",
    asyncHandler(async (req, res) => {
      const { name, email, role, password } = req.body;

      try {
        userSchema.parse({
          name,
          email,
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({ error: error.errors });
          return;
        }
        throw error;
      }

      const userId = await authenticationService.registerUser(
        {
          name,
          email,
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        password,
      );

      const token = await authenticationService.createJWT(userId);

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      res.status(201).json({
        message: "User created successfully",
        data: {
          id: userId,
          name,
          email,
          role,
        },
      });
    }),
  );

  router.post(
    "/login",
    asyncHandler(async (req, res) => {
      const { email, password } = req.body;

      const userId = await authenticationService.loginUser(email, password);
      if (!userId) {
        throw createError("Email ou senha inválidos.", 401);
      }

      const token = await authenticationService.createJWT(userId.id);
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      res.status(200).json({
        name: userId.name,
        email: userId.email,
        role: userId.role,
        id: userId.id,
      });
    }),
  );

  router.post(
    "/logout",
    services.jwtMiddleware.validateToken,
    (req, res, next) => {
      try {
        const token = req.cookies.token;
        if (!token) {
          throw createError("Unauthorized", 401);
        }

        res.clearCookie("token");
        res.status(200).json({ message: "Logout successful" });
      } catch (error) {
        next(error);
      }
    },
  );

  return router;
}
