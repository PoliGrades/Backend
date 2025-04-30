import express from "express";

const app = express();

app.get("/", (_req, res) => {
  res.send("Welcome to the Dinosaur API!");
});

app.listen(8000);
console.log(`Server is running on http://localhost:8000`);
