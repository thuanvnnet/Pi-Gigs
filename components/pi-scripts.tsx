// components/pi-scripts.tsx
"use client"; // <--- QUAN TRỌNG NHẤT: Dòng này biến nó thành Client Component

import Script from "next/script";

// Get sandbox mode from environment variable
// For client components, NEXT_PUBLIC_* vars are automatically exposed by Next.js
const getSandboxMode = (): boolean => {
  const sandboxEnv = process.env.NEXT_PUBLIC_PI_SANDBOX;
  return sandboxEnv === 'true';
};

const sandboxMode = getSandboxMode();
const sandboxEnvValue = process.env.NEXT_PUBLIC_PI_SANDBOX || 'false';

// Script Init Pi SDK (Polling)
// Using template literal with actual boolean value for better type safety
const PI_SDK_INIT = `
  (function() {
    var checkPi = setInterval(function() {
      if (window.Pi) {
        clearInterval(checkPi);
        try {
          window.Pi.init({ 
            version: "2.0", 
            sandbox: ${sandboxMode}
          });
          console.log("✅ Pi SDK Initialized | Sandbox: ${sandboxEnvValue}");
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
    </>
  );
}