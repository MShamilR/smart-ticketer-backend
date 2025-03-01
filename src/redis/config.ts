import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST as string,
    port: Number(process.env.REDIS_PORT),
  },
  password: process.env.REDIS_PASSWORD as string,
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("🚀 Connected to Redis Cloud");
  } catch (err) {
    console.error("❌ Redis Error:", err);
  }
};

export { redisClient, connectRedis };
