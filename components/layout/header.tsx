"use client";

import Link from "next/link";
import { UserNav } from "@/components/layout/user-nav";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { PiLogin } from "@/components/auth/pi-login"; // Import nút Login cũ

export function Header() {
  const { user, isLoading } = useAuth();

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="flex h-16 items-center px-4 max-w-7xl mx-auto justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#660099]">Pi-Gigs</span>
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {!isLoading && (
            <>
                {user ? (
                    // Nếu đã Login -> Hiện Avatar Menu (chứa nút Logout)
                    <UserNav />
                ) : (
                    // Nếu chưa Login -> Hiện nút Login đơn giản (hoặc dẫn tới trang login)
                    // Ở đây mình tạm dùng Button dẫn tới home để user bấm nút to ở Body
                    <Link href="/">
                        <Button variant="ghost">Sign In</Button>
                    </Link>
                )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}