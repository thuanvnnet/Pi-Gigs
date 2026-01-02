"use client";

import { useState } from "react";
import Script from "next/script";

export default function TestLoginPage() {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);
    console.log(msg);
  };

  const runTest = async () => {
    addLog("🚀 Bắt đầu test...");
    
    // @ts-ignore
    if (!window.Pi) {
      addLog("❌ Lỗi: window.Pi chưa tồn tại. Đợi SDK tải...");
      return;
    }

    try {
      // 1. Init
      addLog("⚙️ Đang Init SDK...");
      // @ts-ignore
      window.Pi.init({ version: "2.0", sandbox: true });
      addLog("✅ Init xong (hoặc đã init trước đó)");

      // 2. Auth
      addLog("⏳ Đang gọi authenticate...");
      // @ts-ignore
      const auth = await window.Pi.authenticate(["username", "payments"], {
        onIncompletePaymentFound: (p: any) => addLog("⚠️ Treo đơn: " + p.paymentId)
      });

      addLog("🎉 THÀNH CÔNG RỰC RỠ!");
      addLog("User: " + auth.user.username);
      addLog("UID: " + auth.user.uid);
      alert("Test Thành Công: " + auth.user.username);

    } catch (err: any) {
      addLog("❌ LỖI RỒI: " + err);
      // Log chi tiết lỗi timeout
      if (err.toString().includes("time out")) {
        addLog("👉 Gợi ý: Lỗi Timeout 100% là do sai URL trong Portal.");
        addLog("👉 URL hiện tại trình duyệt thấy: " + window.location.href);
      }
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Trang Test Cô Lập</h1>
      
      <div className="mb-4 p-2 bg-gray-100 rounded text-xs break-all">
        URL Hiện tại: {typeof window !== 'undefined' ? window.location.href : ''}
      </div>

      <button 
        onClick={runTest}
        className="w-full bg-purple-600 text-white p-4 rounded-lg font-bold text-xl active:bg-purple-800"
      >
        TEST LOGIN NGAY
      </button>

      <div className="mt-4 bg-black text-green-400 p-2 rounded h-64 overflow-auto text-sm font-mono border border-gray-700">
        {logs.map((log, i) => (
          <div key={i} className="border-b border-gray-800 py-1">{log}</div>
        ))}
      </div>
      
      {/* Load SDK thủ công ở đây để chắc chắn nó có mặt */}
      <Script src="https://sdk.minepi.com/pi-sdk.js" strategy="afterInteractive" />
    </div>
  );
}