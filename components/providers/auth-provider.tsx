// components/providers/auth-provider.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authenticateUser } from "@/app/actions/auth";
import Script from "next/script";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  username: string;
  piUserId: string;
  walletBalance: string; 
  roles: string;
  avatarUrl?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Hàm Login chính
  const login = async () => {
    setIsLoading(true);
    try {
      if (!window.Pi) throw new Error("Pi SDK not found");

      // 1. Authenticate với scopes ĐẦY ĐỦ
      const scopes = ["username", "payments"]; 
      const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);

      // 2. Gọi Server Action để lấy thông tin từ DB
      const result = await authenticateUser({
        accessToken: authResult.accessToken,
        user: authResult.user,
      });

      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem("pi_user", JSON.stringify(result.user));
        router.refresh();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      alert("Login failed: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("pi_user");
    window.location.href = "/"; 
  };

  const onIncompletePaymentFound = (payment: any) => {
    console.log("Incomplete Payment Found:", payment);
    // Xử lý payment treo nếu cần (sẽ làm sau)
  };

  // Tự động load user từ LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem("pi_user");
    if (stored) {
      try {
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem("pi_user");
      }
    }
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      <Script 
        src="https://sdk.minepi.com/pi-sdk.js" 
        strategy="afterInteractive"
        onLoad={() => {
          if (window.Pi) {
            // Init SDK
            window.Pi.init({ version: "2.0", sandbox: process.env.NEXT_PUBLIC_PI_SANDBOX === "true" });
          }
        }}
      />
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);