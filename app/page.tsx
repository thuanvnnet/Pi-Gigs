// app/page.tsx
import prisma from "@/lib/prisma";
import { GigCard } from "@/components/gigs/gig-card";
import { PiLogin } from "@/components/auth/pi-login"; // Vẫn giữ nút login ở góc hoặc banner
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Force dynamic để luôn lấy dữ liệu mới nhất (Marketplace cần realtime tương đối)
export const dynamic = 'force-dynamic';

async function getGigs() {
  try {
    const gigs = await prisma.gig.findMany({
      where: {
        status: "ACTIVE", // Chỉ lấy Gig đang hoạt động
      },
      orderBy: {
        createdAt: "desc", // Mới nhất lên đầu
      },
      include: {
        seller: {
          select: {
            username: true,
            avatarUrl: true,
            sellerRatingAvg: true,
          },
        },
        category: true,
      },
    });
    return gigs;
  } catch (error) {
    console.error("Failed to fetch gigs:", error);
    return [];
  }
}

export default async function Home() {
  const gigs = await getGigs();

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      
      {/* 1. HERO SECTION (Banner) */}
      <div className="bg-[#0d084d] text-white py-20 px-4">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Find the perfect <i className="font-serif italic text-green-400">freelance</i> services<br/> 
                for your business using <span className="text-[#bf7aff]">Pi Coin</span>
            </h1>
            
            {/* Thanh tìm kiếm (Placeholder - sẽ làm sau) */}
            <div className="w-full max-w-2xl flex gap-2 p-2 bg-white rounded-lg shadow-lg mt-4">
                <input 
                    type="text" 
                    placeholder="What service are you looking for today?" 
                    className="flex-1 px-4 py-3 text-gray-900 outline-none rounded-md"
                />
                <Button className="bg-green-600 hover:bg-green-700 h-full px-8 text-lg font-bold">
                    Search
                </Button>
            </div>

            {/* Quick Categories */}
            <div className="flex gap-4 text-sm text-gray-300 mt-4 overflow-x-auto">
                <span>Popular:</span>
                <Link href="#" className="hover:text-white border px-2 rounded-full border-gray-600">Web Design</Link>
                <Link href="#" className="hover:text-white border px-2 rounded-full border-gray-600">Logo Design</Link>
                <Link href="#" className="hover:text-white border px-2 rounded-full border-gray-600">Pi Apps</Link>
            </div>
        </div>
      </div>

      {/* 2. GIGS GRID */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Recently Added Gigs</h2>
            
            {/* Component Login nằm gọn ở đây để user tiện thao tác */}
            <div className="scale-90 origin-right">
                <PiLogin /> 
            </div>
        </div>

        {gigs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-dashed">
                <h3 className="text-lg font-medium text-gray-500">No gigs available yet.</h3>
                <p className="text-sm text-gray-400 mb-4">Be the first seller on Pi-Gigs!</p>
                <Link href="/dashboard/create-gig">
                    <Button>Create a Gig</Button>
                </Link>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {gigs.map((gig) => (
                    // Ép kiểu (casting) nhẹ để khớp type vì Prisma Decimal trả về object
                    <GigCard key={gig.id} gig={gig as any} />
                ))}
            </div>
        )}
      </div>

    </main>
  );
}

