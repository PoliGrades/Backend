import cookieParser from "cookie-parser";
import express from "express";
import cors from "npm:cors";
import { MockDatabase } from "./database/MockDatabase.ts";
import { PostgresDatabase } from "./database/PostgresDatabase.ts";
import { IDatabase } from "./interfaces/IDatabase.ts";
import { ValidateJWT } from "./middlewares/ValidateJWT.ts";
import { AuthenticationService } from "./services/AuthenticationService.ts";
import { ClassService } from "./services/ClassService.ts";

const app = express();

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

app.use(cookieParser());
app.use(express.json());

app.use(cors({
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
}));

app.post("/auth/register", async (req, res) => {
  const { name, email, role, password } = req.body;
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
      secure: false,
      sameSite: "strict",
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
      secure: false,
      sameSite: "strict",
    });

    res.status(200).send();
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

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
