import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { registerSocketHandlers } from "./sockets/socket.handler.js";

const normalizeOrigin = (value) => String(value || "").replace(/\/$/, "");

const startServer = async () => {
  await connectDB();

  const httpServer = http.createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: normalizeOrigin(env.FRONTEND_URL),
      credentials: true,
    },
  });

  app.set("io", io);
  registerSocketHandlers(io);

  httpServer.listen(env.PORT, () => {
    if (env.NODE_ENV !== "production") {
      console.log(`Server running on port ${env.PORT}`);
    }
  });
};

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
