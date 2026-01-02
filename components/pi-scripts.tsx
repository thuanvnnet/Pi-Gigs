// components/pi-scripts.tsx
"use client"; // <--- QUAN TRỌNG NHẤT: Dòng này biến nó thành Client Component

import Script from "next/script";
import { useEffect } from "react";

// Script Init Pi SDK (Polling)
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
          console.log("✅ Pi SDK Initialized | Sandbox: ${process.env.NEXT_PUBLIC_PI_SANDBOX}");
        } catch (err) {
          console.error("Pi Init Failed:", err);
        }
      }
    }, 50);
  })();
`;

export function PiScripts() {
  return (
    <>
      {/* 1. Load SDK */}
      <Script src="https://sdk.minepi.com/pi-sdk.js" strategy="afterInteractive" />

      {/* 2. Init SDK */}
      <Script id="pi-init" strategy="afterInteractive">
        {PI_SDK_INIT}
      </Script>

      {/* 3. Debug Eruda (Đây là chỗ gây lỗi nếu để ở layout.tsx vì có onLoad) */}
      <Script 
        src="//cdn.jsdelivr.net/npm/eruda" 
        onLoad={() => {
          // @ts-ignore
          if (typeof window !== 'undefined' && window.eruda) {
             // @ts-ignore
             window.eruda.init();
          }
        }} 
      />
    </>
  );
}