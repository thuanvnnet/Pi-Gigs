// app/layout.tsx
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Script from "next/script";
import { AuthProvider } from "@/components/providers/auth-provider";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Pi-Gigs | Freelance Services for Pi Network",
  description: "The #1 Gig Marketplace on Pi Network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* KHÔNG ĐỂ Script ở đây để tránh xung đột với Extension/Antivirus */}
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}