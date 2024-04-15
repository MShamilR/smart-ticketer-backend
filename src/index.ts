import express from "express";
import authRoute from "./routes/authRoute.ts";
import "dotenv/config";

const app = express();

app.use(express.json());
//app.use(cookieParser());

app.use("/api/auth", authRoute);
// app.use("/api/user", userRoute);
// app.use("/api/recipe", recipeRoute);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  });
});

app.listen(process.env.PORT, () => {
  console.log(`smart-ticketer-backend listening on port ${process.env.PORT}`);
});
