import { Prisma, PrismaClient } from './generated/prisma'
import * as bcript from "bcrypt";
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();


 function createRandomUser() :Prisma.UserCreateInput {
   return {
     phone: faker.phone.number({ style: "international" }),
     password: faker.internet.password(),
     randToken: faker.internet.jwt()
  };
}

 const userData = faker.helpers.multiple(createRandomUser, {
  count: 5,
});

async function main() {
  console.log("Scripting is starting...");
  const salt = await bcript.genSalt(10);
  const password = await bcript.hash("1234567", salt);
  for(const user of userData) {
    user.password = password;
    await prisma.user.create(
      {
        data: user
      }
    )
  }
  console.log("Scripting done");
}

main().then(async () =>
  await prisma.$disconnect()).catch(async (e) => {
    console.log(e);
    await prisma.$disconnect();
    process.exit(1);
  })