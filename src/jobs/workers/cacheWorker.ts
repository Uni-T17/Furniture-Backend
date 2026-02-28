import { Worker } from "bullmq";
import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
});

export const cacheWorker = new Worker(
  //name of the worker must be the same with queue
  "cache-invalidation",
  // what function will do for the incoming job
  async (job) => {
    const { pattern } = job.data;
    await invalidateCache(pattern);
  },
  // connection with redis
  {
    connection: {
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT) || 6379,
    },
    // the concurrency for doing job at the same time
    concurrency: 5,
  },
);

// for complete
cacheWorker.on("completed", (job) => {
  console.log(`Job completed with result ${job.id}`);
});

// for failed
cacheWorker.on("failed", (job: any, err) => {
  console.log(`Job ${job.id} failed with ${err.message}`);
});

const invalidateCache = async (pattern: string) => {
  // Put in try catch
  try {
    //devide into stream which will march with pattern
    const stream = redis.scanStream({
      match: pattern,
      count: 100,
    });
    // Put into pipeline
    const pipeline = redis.pipeline();
    // count total key
    let totalKeys = 0;
    // Process key in batches
    stream.on("data", (keys: string[]) => {
      // Delete all key from the keys string array with for each if keys exist
      if (keys.length > 0) {
        keys.forEach((key) => {
          pipeline.del(key);
          totalKeys++;
        });
      }
    });

    // Wrap stream event in Promise
    await new Promise<void>((resolve, reject) => {
      stream.on("end", async () => {
        try {
          if (totalKeys > 0) {
            await pipeline.exec();
            console.log(`Invalidated ${totalKeys} keys`);
          }
          resolve();
        } catch (exeError) {
          reject(exeError);
        }
      });
      stream.on("error", (error) => {
        reject(error);
      });
    });
  } catch (error) {
    console.error("Cache Invalidation error: ", error);
    throw error;
  }
};
