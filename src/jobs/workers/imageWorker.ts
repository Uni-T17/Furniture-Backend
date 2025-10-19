import { Worker } from "bullmq";
import { Redis } from "ioredis";
import path from "path";
import sharp from "sharp";
import "dotenv/config";

const connection = new Redis({
  host: process.env.REDIS_HOST,
  port: 6379,
  //   password: process.env.REDIS_PASSWORD!,
  maxRetriesPerRequest: null,
});

const imageWorker = new Worker(
  "imageQueue",
  async (job) => {
    const { filePath, fileName } = job.data;

    const optimizedImagePath = path.join(
      __dirname,
      "../../../upload/optimize/",
      fileName
    );

    await sharp(filePath)
      .resize(200, 200)
      .webp({ quality: 70 })
      .toFile(optimizedImagePath);
  },
  { connection }
);

imageWorker.on("completed", (job) => {
  console.log(`Job is completed: ${job.id}`);
});

imageWorker.on("failed", (job: any, err) => {
  console.log(`Job is failed: ${job.id} with error: ${err.message}`);
});
