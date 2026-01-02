// components/auth/pi-login.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { Loader2, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation"; // 1. Import router
import { useState } from "react";

export function PiLogin() {
  const { user, login, isLoading } = useAuth();
  const router = useRouter(); // 2. Hook router
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Hàm xử lý đăng nhập và redirect
  const handleLogin = async () => {
    try {
      await login();
      // Sau khi login thành công (không bị throw error), chuyển hướng ngay
      setIsRedirecting(true);
      router.push("/dashboard/create-gig");
    } catch (error) {
      // Lỗi đã được xử lý alert bên trong AuthProvider
      console.error("Login flow error", error);
    }
  };

  // Trạng thái đang tải (Loading Init hoặc Redirecting)
  if (isLoading || isRedirecting) {
    return (
        <Button disabled variant="outline" className="w-full">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isRedirecting ? "Redirecting..." : "Loading..."}
        </Button>
    );
  }

  // Trường hợp ĐÃ ĐĂNG NHẬP
  if (user) {
    return (
      <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-green-50">
        <div className="text-center">
            <h3 className="text-xl font-bold text-green-700">
            Welcome back, {user.username}!
            </h3>
            <p className="text-sm text-green-600">
                Balance: {Number(user.walletBalance).toFixed(2)} Pi
            </p>
        </div>
        
        {/* Nút dẫn thẳng tới trang Create Gig */}
        <Button 
            onClick={() => router.push("/dashboard/create-gig")}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Gig Now
        </Button>
      </div>
    );
  }

  // Trường hợp CHƯA ĐĂNG NHẬP
  return (
    <Button 
      onClick={handleLogin} 
      size="lg" 
      className="bg-[#660099] hover:bg-[#4d0073] text-white font-bold w-full sm:w-auto"
    >
      Login with Pi & Create Gig
    </Button>
  );
}