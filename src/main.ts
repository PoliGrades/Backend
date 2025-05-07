import express from "express";
import { Server } from "npm:socket.io";
import { createServer } from "node:http";
import cors from "npm:cors";
import { addMessage } from "./lc/model.ts";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
}));

const wsServer = createServer(app);
const io = new Server(wsServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});

app.get("/", (_req, res) => {
  res.send("Welcome to the Dinosaur API!");
});

io.on("connection", (socket) => {
  socket.on("message", async (e) => {
    await addMessage(e).then((final) => {
      socket.emit("message", final);
    });
  });
});

wsServer.listen(8000);
console.log(`Server is running on http://localhost:8000`);
