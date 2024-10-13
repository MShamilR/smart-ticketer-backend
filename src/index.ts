import express, { Request, Response, NextFunction } from "express";
import { createServer } from "node:http";
import userRoute from "./routes/userRoute";
import authRoute from "./routes/authRoute";
import busRoute from "./routes/busRoute";
import tripRoute from "./routes/tripRoute";
import {
  NotFoundError,
  ApiError,
  InternalError,
  ErrorType,
} from "./core/apiError";
import "dotenv/config";
import { configureSocket } from "./socket.io/config";

const app = express();

const server = createServer(app);

// Todo: This Socket.IO implementation has not been tested.
configureSocket(server);

app.use(express.json());

const publicRouter = express.Router();
const authRouter = express.Router();

// Public Routes
publicRouter.use("/user", userRoute);

// Authorization / Authenticated Routes
authRouter.use("/", authRoute);
authRouter.use("/bus", busRoute);
authRouter.use("/user", userRoute);
authRouter.use("/trip", tripRoute);
authRouter.use("/ticket", tripRoute);

app.use("/api/v1.0", publicRouter);
app.use("/api/v1.0/auth", authRouter);

// Middleware Error Handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    console.log(err);
    ApiError.handle(err, res);
  } else {
    ApiError.handle(new InternalError(), res);
  }
});

server.listen(process.env.PORT, () => {
  console.log(`smart-ticketer-backend listening on port ${process.env.PORT}`);
});
