-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'AUTHOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('ACTIVE', 'INACTIVE', 'FREEZE');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "firstName" VARCHAR(52),
    "lastName" VARCHAR(52),
    "phone" VARCHAR(15) NOT NULL,
    "email" VARCHAR(52),
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "status" "public"."Status" NOT NULL DEFAULT 'ACTIVE',
    "lastLogin" TIMESTAMP(3),
    "errorLoginCount" SMALLINT NOT NULL DEFAULT 0,
    "randToken" TEXT NOT NULL,
    "image" VARCHAR(225),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Post" (
    "id" SERIAL NOT NULL,
    "authorId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "typeId" INTEGER NOT NULL,
    "title" VARCHAR(225) NOT NULL,
    "content" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "image" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Category" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(52) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Type" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(52) NOT NULL,

    CONSTRAINT "Type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "typeId" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "rating" SMALLINT NOT NULL DEFAULT 0,
    "inventory" INTEGER NOT NULL DEFAULT 0,
    "status" "public"."Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Image" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "path" VARCHAR(255) NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Order" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "code" VARCHAR(15) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductsOnOrder" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "orderId" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "quantity" SMALLINT NOT NULL,

    CONSTRAINT "ProductsOnOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Tag" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(52) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Taggable" (
    "id" SERIAL NOT NULL,
    "tagId" INTEGER NOT NULL,
    "type" VARCHAR(7) NOT NULL,
    "typeId" INTEGER NOT NULL,

    CONSTRAINT "Taggable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Otp" (
    "id" SERIAL NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "otp" VARCHAR(6) NOT NULL,
    "rememberToken" TEXT NOT NULL,
    "verifiedToken" TEXT,
    "count" SMALLINT NOT NULL DEFAULT 0,
    "error" SMALLINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "public"."Type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "public"."Type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Image" ADD CONSTRAINT "Image_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductsOnOrder" ADD CONSTRAINT "ProductsOnOrder_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductsOnOrder" ADD CONSTRAINT "ProductsOnOrder_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Taggable" ADD CONSTRAINT "Taggable_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
