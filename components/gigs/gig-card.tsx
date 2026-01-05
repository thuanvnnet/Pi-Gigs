// components/gigs/gig-card.tsx
import Link from "next/link";
import Image from "next/image";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, ImageIcon, Clock, CheckCircle2 } from "lucide-react";

// Định nghĩa kiểu dữ liệu nhận vào (Khớp với dữ liệu Prisma trả về)
interface GigCardProps {
  gig: {
    id: string;
    title: string;
    images: string[];
    basePricePi: any; // Prisma Decimal
    ratingAvg: any;   // Prisma Decimal
    ratingCount: number;
    deliveryDays?: number;
    completedSalesCount?: number; // Optional: số lượng đã bán thành công
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
  const gigRating = gig.ratingAvg ? Number(gig.ratingAvg).toFixed(1) : null;
  const sellerRating = gig.seller.sellerRatingAvg 
    ? Number(gig.seller.sellerRatingAvg).toFixed(1) 
    : null;
  const hasRating = gigRating !== null && gig.ratingCount > 0;
  const deliveryDays = gig.deliveryDays || 3;
  // Sử dụng completedSalesCount nếu có, nếu không thì dùng ratingCount như proxy
  const completedSales = gig.completedSalesCount ?? gig.ratingCount;

  return (
    <Link href={`/gigs/${gig.id}`} className="block h-full">
      <Card className="h-full flex flex-col hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border-gray-200 group bg-white">
        
        {/* 1. Thumbnail Image with Overlay */}
        <div className="relative w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {gig.images && gig.images.length > 0 ? (
            <>
              <Image 
                src={gig.images[0]} 
                alt={gig.title} 
                fill 
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                priority={false}
              />
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-medium">No Image</p>
              </div>
            </div>
          )}
          
          {/* Category Badge */}
          {gig.category && (
            <div className="absolute top-3 left-3 z-10">
              <Badge 
                variant="secondary" 
                className="bg-white/90 backdrop-blur-sm text-gray-800 hover:bg-white transition-colors text-xs font-medium shadow-sm"
              >
                {gig.category.name}
              </Badge>
            </div>
          )}
        </div>

        {/* 2. Content Section */}
        <CardHeader className="p-4 pb-3 flex-1 flex flex-col gap-3">
          {/* Seller Info with Rating - MOVED TO TOP */}
          <div className="flex items-center gap-2.5">
            <Avatar className="w-8 h-8 border-2 border-gray-100 group-hover:border-[#31BF75]/30 transition-colors flex-shrink-0">
              <AvatarImage src={gig.seller.avatarUrl || ""} alt={gig.seller.username} />
              <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-[#31BF75] to-[#27995E] text-white">
                {gig.seller.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-gray-900 truncate leading-relaxed">
                  {gig.seller.username}
                </span>
                {sellerRating && (
                  <div className="flex items-center gap-0.5 text-xs text-gray-600">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="font-medium">{sellerRating}</span>
                  </div>
                )}
                {completedSales > 0 && (
                  <div className="flex items-center gap-0.5 text-xs text-green-600 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{completedSales.toLocaleString()} sales</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Title */}
          <h3 
            className="font-semibold text-gray-900 line-clamp-2 group-hover:text-[#31BF75] transition-colors text-base leading-relaxed min-h-[2.5rem] pt-1"
            title={gig.title}
          >
            {gig.title}
          </h3>

          {/* Gig Rating & Delivery Info */}
          <div className="flex items-center gap-3 flex-wrap pt-1">
            {hasRating && (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-gray-900 leading-relaxed">{gigRating}</span>
                </div>
                <span className="text-xs text-gray-500 leading-relaxed">({gig.ratingCount.toLocaleString()})</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-600 leading-relaxed">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              <span className="font-medium">{deliveryDays} {deliveryDays === 1 ? 'day' : 'days'}</span>
            </div>
          </div>
        </CardHeader>

        {/* 3. Footer Price */}
        <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-gray-100 bg-gray-50/50 group-hover:bg-gray-100/50 transition-colors">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              Starting at
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-gray-900 group-hover:text-[#31BF75] transition-colors">
              {price.toFixed(2)}
            </span>
            <span className="text-sm font-semibold text-[#31BF75]">π</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}