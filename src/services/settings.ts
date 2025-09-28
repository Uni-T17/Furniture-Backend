import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

export const getSettingStatus = async (key: string) => {
  return await prisma.setting.findUnique({
    where: {
      key,
    },
  });
};

export const createOrUpdateSetting = async (key: string, value: string) => {
  return await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
};
