import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 1. Import các thành phần (Chỉ import 1 lần)
import { AuthProvider } from "@/components/providers/auth-provider";
import { Header } from "@/components/layout/header";
import { PiScripts } from "@/components/pi-scripts"; // Component chứa Script tách riêng

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "5.pi Gigs - Freelance Marketplace",
  description: "Hire freelancers with Pi Network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Bọc AuthProvider ở ngoài cùng để quản lý state User */}
        <AuthProvider>
          <Header />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </AuthProvider>

        {/* Nhúng Scripts (SDK + Eruda) - Đã tách ra Client Component để tránh lỗi Build */}
        <PiScripts />
      </body>
    </html>
  );
}