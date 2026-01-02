// app/layout.tsx
import Script from "next/script";
import "./globals.css";
// ... các import khác (AuthProvider, Header...)
import { AuthProvider } from "@/components/providers/auth-provider";
import { Header } from "@/components/layout/header";

// --- SCRIPT KHỞI TẠO THANH TOÁN (PHIÊN BẢN BRACKET NOTATION) ---
const PI_PAYMENT_SCRIPT = `
  window.initPiPayment = async function(paymentData, handlers) {
    console.log("🟢 Starting Pi Payment (Bracket Notation Mode)...");

    if (!window.Pi) {
      alert("Pi SDK not found");
      return;
    }

    // 1. Authenticate (để refresh session)
    try {
        await window.Pi.authenticate(["username", "payments"], {
            onIncompletePaymentFound: function(payment) { console.log("Incomplete:", payment); }
        });
    } catch(err) {
        console.warn("Auth check warning:", err);
    }

    // 2. KHAI BÁO CALLBACKS - DÙNG NGOẶC VUÔNG ĐỂ CHẶN MINIFY
    // Turbopack không thể đổi tên chuỗi ký tự trong dấu ngoặc vuông.
    
    var callbacks = {};

    callbacks['onReadyForServerApproval'] = function(paymentId) {
        console.log("✅ Approval Callback", paymentId);
        handlers.onStatusChange("Verifying...");
        handlers.approve(paymentId);
    };

    callbacks['onServerCompleted'] = function(paymentId, txid) {
        console.log("✅ Completed Callback", paymentId, txid);
        handlers.onStatusChange("Finalizing...");
        handlers.complete(paymentId, txid);
    };

    callbacks['onCancel'] = function(paymentId) {
        console.log("⚠️ Cancel Callback", paymentId);
        handlers.onCancel(paymentId);
    };

    callbacks['onError'] = function(error, payment) {
        console.error("❌ Error Callback", error);
        handlers.onError(error);
    };

    // 3. Gọi SDK
    try {
      console.log("🚀 Sending to SDK with Keys:", Object.keys(callbacks));
      await window.Pi.createPayment(paymentData, callbacks);
    } catch (err) {
      console.error("Payment Launch Error:", err);
      handlers.onError(err);
    }
  };
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Header />
          {children}
          {/* Script SDK of Pi */}
          <Script src="https://sdk.minepi.com/pi-sdk.js" strategy="afterInteractive" />
        </AuthProvider>
      </body>
    </html>
  );
}