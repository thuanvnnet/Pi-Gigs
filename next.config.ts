// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment (optional)
  // Uncomment if deploying with Docker:
  // output: 'standalone',
  
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
  
  // Experimental features for better Server Actions support
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Các config khác nếu có...
};

export default nextConfig;