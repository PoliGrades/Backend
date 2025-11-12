import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import z from "zod";
import { MockDatabase } from "./database/MockDatabase.ts";
import { PostgresDatabase } from "./database/PostgresDatabase.ts";
import { IDatabase } from "./interfaces/IDatabase.ts";
import { ValidateJWT } from "./middlewares/ValidateJWT.ts";
import { userSchema } from "./schemas/zodSchema.ts";
import { AuthenticationService } from "./services/AuthenticationService.ts";
import { ChatService } from "./services/ChatService.ts";
import { ClassService } from "./services/ClassService.ts";

const app = express();

declare module "socket.io" {
  interface Socket {
    user?: {
      id: number;
      name: string;
      role: "STUDENT" | "PROFESSOR";
    };
  }
}

// Instantiate the services
const env = Deno.env.toObject();

let db: IDatabase;

if (!env.ENVIRONMENT) {
  throw new Error("ENVIRONMENT variable is not set");
}

switch (env.ENVIRONMENT) {
  case "production":
    console.log("Running in production mode");
    db = new PostgresDatabase();
    break;
  case "development":
    console.log("Running in development mode");
    db = new MockDatabase();
    break;
  default:
    console.log("Running in default (mock) mode");
    db = new MockDatabase();
    break;
}

const authenticationService = new AuthenticationService(db);
const JWTmiddleware = new ValidateJWT(authenticationService);

const classService = new ClassService(db);
const chatService = new ChatService();

app.use(cookieParser());
app.use(express.json());

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:62800",
    "http://127.0.0.1:5173", // Add alternative localhost address
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
  exposedHeaders: ["Authorization"], // Important for Clerk
}));

export const wsServer = createServer(app);
export const io = new Server(wsServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173", // Add alternative localhost address
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
    exposedHeaders: ["Authorization"], // Important for Clerk
  },
});

app.post("/auth/register", async (req, res) => {
  const { name, email, role, password } = req.body;

  try {
    userSchema.parse({ name, email, role, createdAt: new Date(), updatedAt: new Date() });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    throw error;
  }

  try {
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
  } catch (error: unknown) {
    if (!(error instanceof Error)) {
      throw error;
    }

    res.status(400).json({ error: error.message });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const userId = await authenticationService.loginUser(email, password);
    if (!userId) {
      res.status(401).json({ error: "Email ou senha inválidos." });
      return;
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
    })
  } catch (error: unknown) {
    if (!(error instanceof Error)) {
      throw error;
    }

    res.status(401).json({ error: "Email ou senha inválidos." });
  }
});

app.post("/auth/logout", JWTmiddleware.validateToken, (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful" });
  } catch (error: unknown) {
    if (!(error instanceof Error)) {
      throw error;
    }

    res.status(500).json({ error: error.message });
  }
});

io.use(async (socket, next) => {
  const cookies = socket.handshake.headers.cookie?.split("; ") || [];
  const token = cookies?.find((cookie) => cookie.startsWith("token="))?.split(
    "=",
  )[1];

  if (!token) {
    return next(new Error("Authentication error"));
  }

  await authenticationService.verifyJWT(token)
    .then((user) => {
      if (!user) {
        return next(new Error("Authentication error"));
      }
      //@ts-ignore just to avoid the error
      socket.user = user;
      next();
    })
    .catch(() => {
      return next(new Error("Authentication error"));
    });
});

io.on("connection", (socket) => {
  socket.on("joinChat", async (professorID: number) => {
    socket.join(`chat_${professorID}`);

    // Try to retrieve previous messages from MongoDB and send to the user
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
      console.log(data);

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

wsServer.listen(3000, () => {
  console.log("Server is running on port 3000");
});
