import { Queue } from "bullmq";
import { Redis } from "ioredis";
import "dotenv/config";

const connection = new Redis({
  host: process.env.REDIS_HOST,
  port: 6379,
  //   password: process.env.REDIS_PASSWORD!, // This is only need in cloud hosting
});

const ImageQueue = new Queue("imageQueue", { connection });

export default ImageQueue;
