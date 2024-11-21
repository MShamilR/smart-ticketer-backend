import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import EmitterBase from "./emitters/EmitterBase";
import UserManager from "./utils/UserManager";
import "dotenv/config";

export const configureSocket = (server: HttpServer) => {
  const io = new Server(server);

  EmitterBase.setInstance(io);

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      console.log(
        "No token provided, connection will proceed without authentication"
      );
      return next();
    }

    try {
      const { userInfo } = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as {
        userInfo: { id: number; email: string; role: string };
      };
      socket.data.user = userInfo;
      next();
    } catch (err) {
      console.log("Invalid token, connection denied");
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log("A client connected: ", socket.id);

    if (socket.data.user) {
      const user = socket.data.user as { id: string };
      const userId = user.id;
      UserManager.addUser(userId, socket.id);
      console.log(`User ${userId} connected with socket ID: ${socket.id}`);
    } else {
      console.log("Client connected without authentication");
    }

    socket.on("disconnect", () => {
      console.log(`Client with ID ${socket.id} disconnected`);
      if (socket.data.user) {
        const userId = socket.data.user.id as string;
        UserManager.deleteUser(userId);
        console.log(`User ${userId} removed from connected users`);
      }
    });
  });

  return io;
};
