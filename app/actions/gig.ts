// app/actions/gig.ts
"use server";

import prisma from "@/lib/prisma";
import { gigSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";

export async function createGig(formData: any, sellerId: string) {
  // 1. Validate dữ liệu đầu vào
  const result = gigSchema.safeParse(formData);
  
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const data = result.data;

  try {
    // 2. Tạo Slug (URL thân thiện) từ Title
    // Ví dụ: "I will design logo" -> "i-will-design-logo-123456"
    const slug = `${data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;

    // 3. Insert vào Database
    await prisma.gig.create({
      data: {
        sellerId: sellerId,
        title: data.title,
        slug: slug,
        description: data.description,
        basePricePi: data.basePricePi,
        deliveryDays: data.deliveryDays,
        categoryId: parseInt(data.categoryId), // Chuyển string sang int nếu DB là Int
        images: data.images, // Prisma tự convert array sang JSON
        status: "ACTIVE",
      },
    });

    // 4. Update cache để trang chủ hiện Gig mới ngay lập tức
    revalidatePath("/");
    
    return { success: true };

  } catch (error) {
    console.error("Create Gig Error:", error);
    return { success: false, error: "Failed to create Gig. Please try again." };
  }
}