import express from "express";
import { createServer } from "node:http";
import cors from "npm:cors";
import { Server } from "npm:socket.io";
import { addMessage } from "./lc/model.ts";

const app = express();

app.use(cors({
  origin: "*",
}));

const wsServer = createServer(app);
export const io = new Server(wsServer, {
  cors: {
    origin: "*",
  },
});

app.get("/", (_req, res) => {
  res.send("Welcome to the Dinosaur API!");
});


// Handle messages from chat
export const pendingConfirmation = new Map();

io.on("connection", (socket) => {
  socket.on("message", async (e) => {
    await addMessage(e).then((final) => {
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
console.log(`Server is running on http://localhost:8000`);
