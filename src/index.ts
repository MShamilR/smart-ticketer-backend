import express, { Request, Response, NextFunction } from "express";
import authRoute from "./routes/authRoute";
import {
  NotFoundError,
  ApiError,
  InternalError,
  ErrorType,
} from "./core/apiError";
import "dotenv/config";

const app = express();

app.use(express.json());
//app.use(cookieParser());

app.use("/api/auth", authRoute);
// app.use("/api/user", userRoute);
// app.use("/api/recipe", recipeRoute);

// Middleware Error Handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    console.log("Hi");
    console.log(err);
    ApiError.handle(err, res);
  } else {
    ApiError.handle(new InternalError(), res);
  }
  //if (err.type === ErrorType.INTERNAL)
  // Logger.error(
  //   `500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
  // );
  //} else {
  // Logger.error(
  //   `500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
  // );
  // Logger.error(err);
  // if (environment === "development") {
  //   return res.status(500).send(err);
  // }
});

// Check: Wouldn't need this middleware
//   app.use((err, req, res, next) => {
//   const statusCode = err.statusCode || 500;
//   const message = err.message || "Internal server error";
//   return res.status(statusCode).json({
//     success: false,
//     message,
//     statusCode,
//   });
// });

app.listen(process.env.PORT, () => {
  console.log(`smart-ticketer-backend listening on port ${process.env.PORT}`);
});
