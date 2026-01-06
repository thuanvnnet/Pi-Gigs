// app/actions/auth.ts
"use server";

import prisma from "@/lib/prisma";

export type AuthResult = {
  success: boolean;
  user?: any;
  error?: string;
};

export async function authenticateUser(piData: {
  accessToken: string;
  user: { uid: string; username: string };
}): Promise<AuthResult> {
  try {
    const { user: piUser } = piData;

    // 1. Tìm hoặc Tạo User
    let dbUser = await prisma.user.findUnique({
      where: { piUserId: piUser.uid },
    });

    if (!dbUser) {
      console.log("Creating new user:", piUser.username);
      dbUser = await prisma.user.create({
        data: {
          piUserId: piUser.uid,
          username: piUser.username,
          walletBalance: 0, // Prisma tự hiểu là Decimal(0)
        },
      });
    }

    // 2. [QUAN TRỌNG] Serialize dữ liệu (Decimal -> String)
    // Để tránh lỗi "Decimal objects are not supported"
    const serializedUser = {
      ...dbUser,
      walletBalance: dbUser.walletBalance.toString(), // Chuyển Decimal thành String
      sellerRatingAvg: dbUser.sellerRatingAvg.toString(), // Chuyển Decimal thành String
      createdAt: dbUser.createdAt.toISOString(), // Date -> String (cho an toàn)
      updatedAt: dbUser.updatedAt.toISOString(), // Date -> String
      // Các trường mới đã được include tự động từ dbUser
    };

    return { success: true, user: serializedUser };
    
  } catch (error: any) {
    console.error("Auth Error:", error);
    return { success: false, error: error.message || "Failed to authenticate" };
  }
}