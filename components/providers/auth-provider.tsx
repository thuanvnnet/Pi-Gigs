// components/providers/auth-provider.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authenticateUser } from "@/app/actions/auth";
import Script from "next/script"; // Import Script tại đây

// ... (Giữ nguyên các type User, AuthContextType cũ)
type User = {
    id: string;
    username: string;
    piUserId: string;
    walletBalance: string; // Decimal trả về string từ API
    roles: "USER" | "ADMIN" | "MOD";
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
  const [isPiSdkReady, setIsPiSdkReady] = useState(false); // State mới để theo dõi SDK

  // Hàm login
  const login = async () => {
    // Chặn nếu SDK chưa tải xong
    if (!isPiSdkReady) {
        alert("Pi SDK is loading... Please wait a moment.");
        return;
    }

    setIsLoading(true);
    try {
      if (!window.Pi) throw new Error("Pi SDK not found");

      const scopes = ["username", "payments"];
      const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);

      const result = await authenticateUser({
        accessToken: authResult.accessToken,
        user: authResult.user,
      });

      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem("pi_user", JSON.stringify(result.user));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("pi_user");
  };

  const onIncompletePaymentFound = (payment: any) => {
    console.log("Incomplete payment:", payment);
  };

  useEffect(() => {
    const stored = localStorage.getItem("pi_user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {/* Đưa Script vào đây.
        onLoad: Sẽ chạy NGAY LẬP TỨC khi file pi-sdk.js tải xong.
        Đảm bảo Pi.init() luôn chạy đúng thời điểm.
      */}
      <Script 
        src="https://sdk.minepi.com/pi-sdk.js" 
        strategy="afterInteractive"
        onLoad={() => {
            console.log("Pi SDK Loaded Successfully");
            if (window.Pi) {
                window.Pi.init({ version: "2.0", sandbox: process.env.NEXT_PUBLIC_PI_SANDBOX === "true" });
                setIsPiSdkReady(true);
            }
        }}
        onError={() => {
            console.error("Failed to load Pi SDK");
            // Có thể hiện thông báo lỗi cho user
        }}
      />
      
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);