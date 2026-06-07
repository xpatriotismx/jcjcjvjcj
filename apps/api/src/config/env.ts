import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  PUBLIC_APP_URL: z.string().url().default("http://localhost:5173"),
  SHELTER_HOURLY_COST: z.coerce.bigint().positive().default(10_000_000n),
  SHELTER_NINE_HOUR_GOLD_COST: z.coerce.bigint().positive().default(90n),
  WS_HEARTBEAT_MS: z.coerce.number().int().min(10_000).default(25_000)
});

export const env = schema.parse(process.env);
