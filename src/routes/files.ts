import { Router } from "express";
import { asyncHandler } from "../utils/errorHandler.ts";

export function createFileRoutes(): Router {
  const router = Router();

  router.get(
    "/download/:filename",
    asyncHandler(async (req, res) => {
      const filename = req.params.filename;
      const filePath = `./uploads/${filename}`;

      res.download(filePath, (err) => {
        if (err) {
          res.status(500).json({
            message: "File download failed",
            error: err.message,
          });
        }
      });
    }),
  );

  return router;
}
