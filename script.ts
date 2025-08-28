import { Prisma, PrismaClient } from './generated/prisma'
import * as bcript from "bcrypt";

const prisma = new PrismaClient();

const userData: Prisma.UserCreateInput[] = [
  {
    phone: "0999832340",
    password: "",
    randToken : "soejoijeoi201fowo"
  },{
    phone: "0999832341",
    password: "",
    randToken : "soejoijeoi201fowo"
  },{
    phone: "0999832342",
    password: "",
    randToken : "soejoijeoi201fowo"
  },{
    phone: "0999832343",
    password: "",
    randToken : "soejoijeoi201fowo"
  },{
    phone: "0999832344",
    password: "",
    randToken : "soejoijeoi201fowo"
  }
]

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