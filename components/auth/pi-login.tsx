// components/auth/pi-login.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { Loader2 } from "lucide-react";

export function PiLogin() {
  const { user, login, isLoading } = useAuth();

  if (isLoading) {
    return <Button disabled>Loading...</Button>;
  }

  if (user) {
    return (
      <div className="flex flex-col items-center gap-2">
        <h3 className="text-xl font-bold text-green-600">
          Hi, {user.username}!
        </h3>
        <p className="text-sm text-gray-500">Balance: {Number(user.walletBalance).toFixed(2)} Pi</p>
        <Button variant="outline" onClick={() => window.location.href = "/dashboard"}>
          Go to Seller Dashboard
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={login} 
      size="lg" 
      className="bg-[#660099] hover:bg-[#4d0073] text-white font-bold"
    >
      Login with Pi
    </Button>
  );
}