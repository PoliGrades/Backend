import { Express } from "express";
import { createServer, Server } from "node:http";
import { Server as SocketServer } from "socket.io";
import { Services } from "../services/serviceContainer.ts";

declare module "socket.io" {
  interface Socket {
    user?: {
      id: number;
      name: string;
      role: "STUDENT" | "PROFESSOR";
    };
  }
}

export function createWebSocketServer(
  app: Express,
  services: Services,
): { wsServer: Server; io: SocketServer } {
  const { authenticationService, chatService } = services;

  const wsServer = createServer(app);
  const io = new SocketServer(wsServer, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:3000",
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
    },
  });

  // Socket.io authentication middleware
  io.use(async (socket, next) => {
    const cookies = socket.handshake.headers.cookie?.split("; ") || [];
    const token = cookies?.find((cookie) => cookie.startsWith("token="))?.split(
      "=",
    )[1];

    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const payload = await authenticationService.verifyJWT(token);
      if (!payload) {
        return next(new Error("Authentication error"));
      }
      socket.user = {
        id: payload.id as number,
        name: payload.name as string,
        role: payload.role as "STUDENT" | "PROFESSOR",
      };
      next();
    } catch {
      return next(new Error("Authentication error"));
    }
  });

  // Socket.io connection handling
  io.on("connection", (socket) => {
    socket.on("joinChat", async (professorID: number) => {
      socket.join(`chat_${professorID}`);

      // Retrieve previous messages from MongoDB and send to the user
      const previousMessages = await chatService.getMessagesFromChat(
        `chat_${professorID}`,
      );

      socket.emit("joinedChat", `chat_${professorID}`);

      if (previousMessages.length > 0) {
        socket.emit("previousMessages", previousMessages);
      }
    });

    socket.on(
      "sendMessage",
      async (data: { professorID: number; message: string }) => {
        const { professorID, message } = data;
        const sender = socket.user;

        if (!sender) {
          socket.emit("error", "User not authenticated");
          return;
        }

        try {
          const result = await chatService.saveMessage(
            message,
            sender,
            `chat_${professorID}`,
          );
          io.to(`chat_${professorID}`).emit("newMessage", result);
        } catch (error) {
          socket.emit("error", error);
        }
      },
    );
  });

  return { wsServer, io };
}
