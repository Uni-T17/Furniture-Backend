import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
});

export const getOrSetCache = async (key: string, cb: any) => {
  try {
    const cachedData = await redis.get(key);
    if (cachedData) {
      console.log("Cache Hit!");
      return JSON.parse(cachedData);
    }

    console.log("Cache miss!");
    const freshData = await cb();
    await redis.setex(key, 3600, JSON.stringify(freshData));
    return freshData;
  } catch (error) {
    console.log("Redis error: ", error);
    throw error;
  }
};
