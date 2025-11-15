import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Express } from "express";

export function setupMiddleware(app: Express) {
  app.use(cookieParser());
  app.use(express.json());

  app.use(cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:62800",
      "http://127.0.0.1:5173",
    ],
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Origin",
      "X-Requested-With",
      "Accept",
    ],
    credentials: true,
    exposedHeaders: ["Authorization"],
  }));
}
