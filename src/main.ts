import express from "express";
import { getConfig } from "./config/environment.ts";
import { setupMiddleware } from "./middleware/setup.ts";
import { setupRoutes } from "./routes/index.ts";
import { createServices } from "./services/serviceContainer.ts";
import { createWebSocketServer } from "./socket/websocket.ts";
import { errorHandler } from "./utils/errorHandler.ts";

function startServer() {
  const config = getConfig();
  const app = express();

  // Setup middleware
  setupMiddleware(app);

  // Create services
  const services = createServices(config.environment, config.secretKey);

  // Setup routes
  setupRoutes(app, services, config.uploadsDir);

  // Error handling middleware should be last
  app.use(errorHandler);

  // Create WebSocket server
  const { wsServer } = createWebSocketServer(app, services);

  // Start the server
  wsServer.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
  });
}

// Start the application
try {
  startServer();
} catch (error) {
  console.error("Failed to start server:", error);
  Deno.exit(1);
}
