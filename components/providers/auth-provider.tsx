"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
// FIX: Chỉ import authenticateUser, bỏ getMe vì ta dùng LocalStorage
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

  const onIncompletePaymentFound = (payment: any) => {
    console.log("Incomplete Payment Found:", payment);
  };

  const login = async () => {
    setIsLoading(true);
    try {
      // @ts-ignore
      if (!window.Pi) {
        alert("Pi SDK not found. Please open in Pi Browser.");
        setIsLoading(false);
        return;
      }

      console.log("Start Authenticate...");
      
      const scopes = ["username", "payments"];
      // @ts-ignore
      const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);

      console.log("Auth Pi Success:", authResult.user.username);

      const result = await authenticateUser({
        accessToken: authResult.accessToken,
        user: authResult.user,
      });

      if (result.success && result.user) {
        setUser(result.user);
        // Lưu user vào LocalStorage để lần sau vào không cần load lại từ server (getMe)
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

  // Tự động load User từ LocalStorage khi F5 trang
  useEffect(() => {
    const stored = localStorage.getItem("pi_user");
    if (stored) {
      try {
        const parsedUser = JSON.parse(stored);
        if (parsedUser && parsedUser.id) {
            setUser(parsedUser);
        }
      } catch (e) {
        localStorage.removeItem("pi_user");
      }
    }
    // Tắt loading ngay lập tức sau khi check storage
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);