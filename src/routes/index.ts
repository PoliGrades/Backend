import { Express } from "express";
import { Services } from "../services/serviceContainer.ts";
import { createAuthRoutes } from "./auth.ts";
import { createClassRoutes } from "./classes.ts";
import { createSubjectRoutes } from "./subjects.ts";
import { createTaskRoutes } from "./tasks.ts";
import { createUserRoutes } from "./users.ts";
import { createWarningRoutes } from "./warnings.ts";

export function setupRoutes(
  app: Express,
  services: Services,
  uploadsDir: string,
) {
  // Auth routes
  app.use("/auth", createAuthRoutes(services));

  // User routes (includes /professors endpoint)
  app.use("/", createUserRoutes(services));

  // Task routes
  const taskRouter = createTaskRoutes(services, uploadsDir);
  app.use("/task", taskRouter);
  app.use("/tasks", taskRouter);

  // Subject routes
  const subjectRouter = createSubjectRoutes(services);
  app.use("/subject", subjectRouter);
  app.use("/subjects", subjectRouter);

  // Class routes
  const classRouter = createClassRoutes(services);
  app.use("/class", classRouter);
  app.use("/classes", classRouter);

  // Warning routes
  const warningRouter = createWarningRoutes(services);
  app.use("/warning", warningRouter);
  app.use("/warnings", warningRouter);
}
