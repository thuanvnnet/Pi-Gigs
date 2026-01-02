// components/gigs/gig-card.tsx
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

// Định nghĩa kiểu dữ liệu nhận vào (Khớp với dữ liệu Prisma trả về)
interface GigCardProps {
  gig: {
    id: string;
    title: string;
    images: string[];
    basePricePi: any; // Prisma Decimal
    ratingAvg: any;   // Prisma Decimal
    ratingCount: number;
    seller: {
      username: string;
      avatarUrl: string | null;
      sellerRatingAvg: any;
    };
    category?: {
        name: string;
    }
  };
}

export function GigCard({ gig }: GigCardProps) {
  // Xử lý hiển thị giá và rating an toàn
  const price = gig.basePricePi ? Number(gig.basePricePi) : 0;
  const rating = gig.ratingAvg ? Number(gig.ratingAvg).toFixed(1) : "New";

  return (
    <Link href={`/gigs/${gig.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer overflow-hidden border-gray-200 group">
        
        {/* 1. Thumbnail Image */}
        <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
          {gig.images && gig.images.length > 0 ? (
            <Image 
              src={gig.images[0]} 
              alt={gig.title} 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 bg-gray-200">
                No Image
            </div>
          )}
        </div>

        {/* 2. Seller Info & Title */}
        <CardHeader className="p-3 pb-0 space-y-2">
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6 border">
              <AvatarImage src={gig.seller.avatarUrl || ""} />
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                {gig.seller.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-700">{gig.seller.username}</span>
            </div>
          </div>
          
          <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-green-600 transition-colors text-sm h-10 leading-5" title={gig.title}>
            {gig.title}
          </h3>
          
          <div className="flex items-center gap-1 text-xs font-semibold">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-gray-700">{rating}</span>
            <span className="text-gray-400 font-normal">({gig.ratingCount})</span>
          </div>
        </CardHeader>

        {/* 3. Footer Price */}
        <CardFooter className="p-3 pt-4 flex items-center justify-between border-t mt-2 bg-slate-50/50">
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                Starting at
            </div>
            <div className="text-base font-bold text-gray-900">
                {price} <span className="text-[#660099]">π</span>
            </div>
        </CardFooter>
      </Card>
    </Link>
  );
}