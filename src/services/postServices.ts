import { connect } from "http2";
import { Prisma, PrismaClient } from "../../generated/prisma";
import { PostType } from "../controllers/types/postType";
import { create } from "domain";

const prisma = new PrismaClient().$extends({
  result: {
    user: {
      fullName: {
        needs: { firstName: true, lastName: true },
        compute(user) {
          return `${user.firstName} ${user.lastName}`;
        },
      },
    },
    post: {
      updatedAt: {
        needs: { updatedAt: true },
        compute(post) {
          return post.updatedAt.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
        },
      },
    },
  },
});

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

export const deletePostById = async (postId: number) => {
  return await prisma.post.delete({
    where: {
      id: postId,
    },
  });
};

export const getPostQuery = async (options: any) => {
  return prisma.post.findMany(options);
};

export const getPostWithRelation = async (postId: number) => {
  return prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      title: true,
      content: true,
      body: true,
      image: true,
      updatedAt: true,
      author: {
        select: {
          fullName: true,
        },
      },
      category: {
        select: {
          name: true,
        },
      },
      type: {
        select: {
          name: true,
        },
      },
      tags: {
        select: {
          name: true,
        },
      },
    },
  });
};
