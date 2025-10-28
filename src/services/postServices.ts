import { connect } from "http2";
import { Prisma, PrismaClient } from "../../generated/prisma";
import { PostType } from "../controllers/types/postType";
import { create } from "domain";

const prisma = new PrismaClient();

// id         Int      @id @default(autoincrement())
//   authorId   Int
//   author     User     @relation(fields: [authorId], references: [id])
//   categoryId Int
//   category   Category @relation(fields: [categoryId], references: [id])
//   typeId     Int
//   type       Type     @relation(fields: [typeId], references: [id])
//   title      String   @db.VarChar(225)
//   content    String
//   body       String
//   image      String   @db.VarChar(255)
//   createdAt  DateTime @default(now())
//   updatedAt  DateTime @updatedAt
//   tags PostTag[]

export const createNewPost = async (postData: PostType) => {
  let data: any = {
    author: {
      connect: { id: postData.authorId },
    },
    category: {
      connectOrCreate: {
        where: {
          name: postData.category,
        },
        create: {
          name: postData.category,
        },
      },
    },
    type: {
      connectOrCreate: {
        where: {
          name: postData.type,
        },
        create: {
          name: postData.type,
        },
      },
    },
    title: postData.title,
    content: postData.content,
    body: postData.body,
    image: postData.image,
  };
  if (postData!.tags && postData!.tags.length > 0) {
    data.tags = {
      connectOrCreate: postData.tags.map((tag) => ({
        where: {
          name: tag,
        },
        create: {
          name: tag,
        },
      })),
    };
  }
  return await prisma.post.create({ data });
};

export const getPostById = async (postId: number) => {
  return await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });
};

export const updatePostById = async (postId: number, postData: PostType) => {
  let data: any = {
    category: {
      connectOrCreate: {
        where: {
          name: postData.category,
        },
        create: {
          name: postData.category,
        },
      },
    },
    type: {
      connectOrCreate: {
        where: {
          name: postData.type,
        },
        create: {
          name: postData.type,
        },
      },
    },
    title: postData.title,
    content: postData.content,
    body: postData.body,
  };
  if (postData.image) {
    data.image = postData.image;
  }
  if (postData.tags && postData.tags.length > 0) {
    data.tags = {
      connectOrCreate: postData.tags.map((tagName) => ({
        where: {
          name: tagName,
        },
        create: {
          name: tagName,
        },
      })),
    };
  }
  return await prisma.post.update({
    where: {
      id: postId,
    },
    data: data,
  });
};
