// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        // Thay thế bằng domain thực tế của project Supabase của bạn
        // Nếu URL là: https://xyz.supabase.co/storage/... thì hostname là 'xyz.supabase.co'
        // Hoặc dùng wildcard như dưới đây để bao quát:
        hostname: '**.supabase.co', 
      },
    ],
  },
  // Các config khác nếu có...
};

export default nextConfig;