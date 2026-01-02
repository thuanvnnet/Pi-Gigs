// components/providers/auth-provider.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authenticateUser } from "@/app/actions/auth";
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

  // Hàm xử lý thanh toán chưa hoàn tất
  const onIncompletePaymentFound = (payment: any) => {
    console.log("Incomplete Payment Found:", payment);
    // TODO: Gửi về server để hoàn tất nếu cần
  };

  const login = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      if (!window.Pi) {
        alert("Pi SDK not found. Please open in Pi Browser.");
        setIsLoading(false);
        return;
      }

      console.log("Start Authenticate...");
      
      // 1. Authenticate
      const scopes = ["username", "payments"];
      // @ts-ignore
      const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);

      console.log("Auth Pi Success:", authResult.user.username);

      // 2. Server Action
      const result = await authenticateUser({
        accessToken: authResult.accessToken,
        user: authResult.user,
      });

      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem("pi_user", JSON.stringify(result.user));
        alert(`Welcome back, ${result.user.username}!`);
        router.refresh();
      } else {
        throw new Error(result.error || "Server validation failed");
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      alert("Login Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("pi_user");
    router.push("/");
    router.refresh();
  };

  // Load user từ LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem("pi_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("pi_user");
      }
    }
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);