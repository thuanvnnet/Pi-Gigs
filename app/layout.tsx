import Script from "next/script";
import "./globals.css";
// ... Import các component khác (Header, AuthProvider...) 
import { AuthProvider } from "@/components/providers/auth-provider";
import { Header } from "@/components/layout/header";

// --- SCRIPT KHỞI TẠO MỚI (CỰC NHANH) ---
// Dùng setInterval để "săn" biến window.Pi mỗi 50ms.
// Hễ thấy là Init ngay lập tức.
const PI_SDK_INIT = `
  (function() {
    var checkPi = setInterval(function() {
      if (window.Pi) {
        clearInterval(checkPi);
        try {
          window.Pi.init({ 
            version: "2.0", 
            sandbox: ${process.env.NEXT_PUBLIC_PI_SANDBOX === 'true'} 
          });
          console.log("✅ Pi SDK Initialized Successfully | Sandbox: ${process.env.NEXT_PUBLIC_PI_SANDBOX}");
        } catch (err) {
          console.error("Pi Init Failed:", err);
        }
      }
    }, 50); // Kiểm tra mỗi 50ms
  })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>

        {/* 1. Load SDK */}
        <Script src="https://sdk.minepi.com/pi-sdk.js" strategy="afterInteractive" />
        
        {/* 2. Init SDK bằng Inline Script (Không dùng onLoad để tránh trễ) */}
        <Script id="pi-init" strategy="afterInteractive">
            {PI_SDK_INIT}
        </Script>
        
        {/* 3. Debug Eruda (Giữ lại để soi lỗi trên điện thoại) */}
        <Script src="//cdn.jsdelivr.net/npm/eruda" onLoad={() => { 
            // @ts-ignore
            eruda.init(); 
        }} />
      </body>
    </html>
  );
}