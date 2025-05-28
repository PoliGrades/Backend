import cookieParser from "cookie-parser";
import { and, eq, gte } from "drizzle-orm";
import express from "express";
import { createServer } from "node:http";
import cors from "npm:cors";
import { Server } from "npm:socket.io";
import { MockDatabase } from "./database/MockDatabase.ts";
import { order, orderItem, product } from "./database/schema.ts";
import { OrderHandler } from "./handlers/OrderHandler.ts";
import { ProductHandler } from "./handlers/ProductHandler.ts";
import { addMessage } from "./lc/model.ts";
import { ValidateJWT } from "./middlewares/ValidateJWT.ts";
import { AuthenticationService } from "./services/AuthenticationService.ts";

// Importing the Socket interface from socket.io
declare module "npm:socket.io" {
  interface Socket {
    user?: {
      id: number;
      name: string;
    };
  }
}

const app = express();

// Instantiate the services
const db = new MockDatabase();
const authenticationService = new AuthenticationService(db);
const JWTmiddleware = new ValidateJWT(authenticationService);

// Instantiate the handlers
export const orderHandler = new OrderHandler(db);
export const productHandler = new ProductHandler(db);

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
  const { name, email, document, password } = req.body;
  try {
    const userId = await authenticationService.registerUser(
      {
        id: 123,
        name,
        email,
        document,
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
        document,
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
      res.status(401).json({ error: "Invalid email or password" });
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

app.get("/company", JWTmiddleware.validateToken, async (_req, res) => {
  const database = db.getDatabase();
  
  const data: {
    orderCount: number;
    productCount: number;
    monthlyRevenue: number;
    // deno-lint-ignore no-explicit-any
    mostOrderedProduct: any;
  } = {
    orderCount: 0,
    productCount: 0,
    monthlyRevenue: 0,
    mostOrderedProduct: null,
  }

  try {
    // Get order count
    const orderCount = await database
      .select()
      .from(order)
      .then((e) => e.length);
    data.orderCount = orderCount;

    // Get product count
    const productCount = await database
      .select()
      .from(product)
      .then((e) => e.length);
    data.productCount = productCount;

    // Get monthly revenue
    const monthlyRevenue = await database
      .select({
        total: order.total
      })
      .from(order)
      .where(and(gte(order.createdAt, new Date(new Date().getFullYear(), new Date().getMonth(), 1)), eq(order.status, "paid")))
      .then((e) => e.reduce((acc, curr) => acc + (curr.total || 0), 0));
    data.monthlyRevenue = monthlyRevenue;

    // Get most ordered product
    const mostOrderedProduct = await database
      .select({
        productId: orderItem.productId,
        count: orderItem.quantity,
      })
      .from(orderItem)
      .groupBy(orderItem.productId, orderItem.quantity)
      .limit(1)
      .then((e) => e[0] || null);
    
    if (mostOrderedProduct) {
      const productDetails = await database
        .select()
        .from(product)
        .where(eq(product.id, mostOrderedProduct.productId))
        .then((e) => e[0] || null);
      data.mostOrderedProduct = productDetails.name;
    }

    console.log(data);

    res.status(200).json({
      message: "Company data retrieved successfully",
      data,
    });
  } catch (error: unknown) {
    if (!(error instanceof Error)) {
      throw error;
    }
    
    res.status(500).json({ error: error.message });
  }
});

// Order section
app.post("/order", JWTmiddleware.validateToken, async (req, res) => {
  const order = req.body;
  const userId = req.user!.id;

  const result = await orderHandler.createOrder(order, userId as number);

  res.status(result.status).json({
    message: result.message,
    data: result.data,
    error: result.error,
  });
});

app.get("/order/:id", JWTmiddleware.validateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const result = await orderHandler.getOrderById(Number(id), userId as number);

  res.status(result.status).json({
    message: result.message,
    data: result.data,
    error: result.error,
  });
});

// TODO: Add JWT validation
app.get("/orders", JWTmiddleware.validateToken, async (_req, res) => {
  const result = await orderHandler.getOrders();

  res.status(result.status).json({
    message: result.message,
    data: result.data,
    error: result.error,
  });
});

app.delete("/order/:id", JWTmiddleware.validateToken, async (req, res) => {
  const { id } = req.params;

  const result = await orderHandler.deleteOrder(Number(id));

  res.status(result.status).json({
    message: result.message,
    data: result.data,
    error: result.error,
  });
});

// TODO: Add JWT validation
app.patch("/order/:id", JWTmiddleware.validateToken, async (req, res) => {
  const { id } = req.params;
  const { status, paymentMethod } = req.body;
  // const _userId = req.user!.id;

  const result = await orderHandler.updateOrderStatus(
    Number(id),
    status,
    paymentMethod ? paymentMethod : undefined,
  );

  res.status(result.status).json({
    message: result.message,
    data: result.data,
    error: result.error,
  });
});
// TODO: Add JWT validation
// Product section
app.post("/product", JWTmiddleware.validateToken, async (req, res) => {
  const product = req.body;

  const result = await productHandler.createProduct(product);

  res.status(result.status).json({
    message: result.message,
    data: result.data,
    error: result.error,
  });
});

app.get("/product/:id", JWTmiddleware.validateToken, async (req, res) => {
  const { id } = req.params;

  const result = await productHandler.getProductById(Number(id));
  res.status(result.status).json({
    message: result.message,
    data: result.data,
    error: result.error,
  });
});

// TODO: Add JWT validation
app.get("/products", JWTmiddleware.validateToken, async (_req, res) => {
  const result = await productHandler.getProducts();
  res.status(result.status).json({
    message: result.message,
    data: result.data,
    error: result.error,
  });
});

// TODO: Add JWT validation
app.delete("/product/:id", JWTmiddleware.validateToken, async (req, res) => {
  const { id } = req.params;
  const result = await productHandler.deleteProduct(Number(id));
  res.status(result.status).json({
    message: result.message,
    data: result.data,
    error: result.error,
  });
});

app.get("/hidden", JWTmiddleware.validateToken, (_req, res) => {
  res.status(200).json({ message: "This is a hidden route" });
});

// Handle messages from chat
export const pendingConfirmation = new Map();

export const userIds = new Map();

io.use(async (socket, next) => {
  const cookies = socket.handshake.headers.cookie?.split("; ") || [];
  const token = cookies?.find((cookie) => cookie.startsWith("token="))?.split("=")[1];

  if (!token) {
    return next(new Error("Authentication error"));
  }

  await authenticationService.verifyJWT(token)
    .then((user) => {
      console.log(user);
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
  socket.on("message", async (e) => {
    await addMessage({ message: e, user: socket.user! }).then((final) => {
      socket.emit("message", final);
    });
  });

  socket.on("order_confirmation", (e) => {
    const { orderId, type } = JSON.parse(e);
    if (pendingConfirmation.has(orderId)) {
      const { resolve } = pendingConfirmation.get(orderId);
      pendingConfirmation.delete(orderId);
      if (type === "confirm") {
        resolve(true);
      } else {
        resolve(false);
      }
    }
  });

  socket.emit(
    "message",
    JSON.stringify({
      type: "welcome",
      message:
        "Olá, tudo bem ?, bem vindo ao PoliEats! Sou um assistente virtual e estou aqui para te ajudar com o que você precisar. Você pode me perguntar sobre o cardápio, horários de funcionamento, fazer pedidos e consultar o status dos pedidos em andamento. Como posso te ajudar hoje? 🤗",
    }),
  );
});

wsServer.listen(8000);
