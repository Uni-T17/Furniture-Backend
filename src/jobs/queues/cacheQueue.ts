import { Queue } from "bullmq";
import { Redis } from "ioredis";
import "dotenv/config";

export const cacheQueue = new Queue("cache-invalidation", {
  connection: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: true,
  },
});
