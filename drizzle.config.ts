import type { Config } from "drizzle-kit";
import "dotenv/config";

export default {
  schema: "./src/schema/*",
} satisfies Config;

