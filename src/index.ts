import express, { Request, Response, NextFunction } from "express";
import userRoute from "./routes/userRoute";
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

// app.use((req, res, next) => {
//   req.url = "/api" + req.url;
//   next();
// });

app.use("/v1.0/user", userRoute);
app.use("/v1.0/auth", authRoute);
// app.use("/api/user", userRoute);
// app.use("/api/recipe", recipeRoute);

// Middleware Error Handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
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

app.listen(process.env.PORT, () => {
  console.log(`smart-ticketer-backend listening on port ${process.env.PORT}`);
});
