// app/page.tsx
import { PiLogin } from "@/components/auth/pi-login";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-50">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Pi-Gigs Marketplace &nbsp;
          <code className="font-mono font-bold">Alpha v1.0</code>
        </p>
      </div>

      <div className="mt-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
          Freelance services for <span className="text-[#660099]">Pi Network</span>
        </h1>
        <p className="text-lg leading-8 text-gray-600 mb-8">
          Kết nối Freelancer và Khách hàng sử dụng Pi Coin. An toàn, Nhanh chóng.
        </p>
        
        {/* Component Đăng nhập */}
        <PiLogin />
      </div>
    </main>
  );
}