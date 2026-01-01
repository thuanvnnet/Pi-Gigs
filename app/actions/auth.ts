// app/actions/auth.ts
"use server";

import prisma from "@/lib/prisma";

export type AuthResult = {
  success: boolean;
  user?: any;
  error?: string;
};

// Hàm này sẽ được gọi khi Pi SDK xác thực thành công ở Client
export async function authenticateUser(piData: {
  accessToken: string;
  user: { uid: string; username: string };
}): Promise<AuthResult> {
  try {
    const { user: piUser } = piData;

    // 1. Kiểm tra xem User đã tồn tại chưa
    let dbUser = await prisma.user.findUnique({
      where: { piUserId: piUser.uid },
    });

    // 2. Nếu chưa có, tạo mới (Register)
    if (!dbUser) {
      console.log("Creating new user:", piUser.username);
      dbUser = await prisma.user.create({
        data: {
          piUserId: piUser.uid,
          username: piUser.username,
          // Mặc định role USER, wallet 0
        },
      });
    } else {
      // 3. Nếu có rồi, update thông tin mới nhất (nếu cần)
      // Ví dụ: Update username nếu họ đổi bên Pi App (tuỳ logic)
    }

    // 4. Trả về user để Client lưu vào State/Context
    return { success: true, user: dbUser };
    
  } catch (error) {
    console.error("Auth Error:", error);
    return { success: false, error: "Failed to authenticate user" };
  }
}