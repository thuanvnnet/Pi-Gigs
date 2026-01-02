// app/gigs/[gigId]/page.tsx
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, CheckCircle2, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Định nghĩa Props cho Next.js 16 (params là Promise)
type Props = {
  params: Promise<{ gigId: string }>;
};

// 1. Hàm lấy dữ liệu Gig
async function getGig(gigId: string) {
  const gig = await prisma.gig.findUnique({
    where: { id: gigId },
    include: {
      seller: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          bio: true,
          createdAt: true,
          sellerRatingAvg: true,
          sellerReviewCount: true,
        },
      },
      category: true,
      reviews: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          buyer: {
            select: { username: true, avatarUrl: true },
          },
        },
      },
    },
  });

  if (!gig) return null;
  return gig;
}

// 2. Metadata động cho SEO
export async function generateMetadata({ params }: Props) {
  const { gigId } = await params;
  const gig = await getGig(gigId);
  if (!gig) return { title: "Gig Not Found" };
  
  return {
    title: `${gig.title} | Pi-Gigs`,
    description: gig.description?.slice(0, 160),
  };
}

// 3. Main Component
export default async function GigDetailPage({ params }: Props) {
  // Await params (Next.js 15/16 requirement)
  const { gigId } = await params;
  const gig = await getGig(gigId);

  if (!gig) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* === LEFT COLUMN: Content === */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Breadcrumb & Title */}
          <div>
            <div className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                <Link href="/" className="hover:underline">Home</Link> / 
                <span className="text-gray-900 font-medium">{gig.category?.name}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">{gig.title}</h1>
            
            {/* Mini Seller Info */}
            <div className="flex items-center gap-4 mt-4 pb-6 border-b">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={gig.seller.avatarUrl || ""} />
                    <AvatarFallback>{gig.seller.username[0]}</AvatarFallback>
                </Avatar>
                <div>
                    <div className="font-bold text-gray-900 flex items-center gap-2">
                        {gig.seller.username}
                        <span className="text-gray-400 font-normal text-sm">|</span>
                        <div className="flex items-center text-yellow-500 text-sm">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="ml-1 text-gray-900">{Number(gig.ratingAvg).toFixed(1)}</span>
                            <span className="text-gray-500 ml-1">({gig.ratingCount})</span>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* Image Gallery (Main Image) */}
          <div className="relative aspect-video w-full bg-gray-200 rounded-lg overflow-hidden border">
            {(gig.images as string[]) && (gig.images as string[]).length > 0 ? (
                <Image 
                    src={(gig.images as string[])[0]} 
                    alt={gig.title} 
                    fill 
                    className="object-cover"
                    priority
                />
            ) : (
                <div className="flex items-center justify-center h-full text-gray-400">No Image Available</div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-bold mb-4">About this Gig</h2>
            <div className="prose max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
                {gig.description}
            </div>
          </div>

          {/* Seller Bio */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-bold mb-4">About the Seller</h2>
            <div className="flex gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={gig.seller.avatarUrl || ""} />
                    <AvatarFallback className="text-xl">{gig.seller.username[0]}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-bold text-lg">{gig.seller.username}</p>
                    <p className="text-gray-500 text-sm mb-2">Member since {new Date(gig.seller.createdAt).toLocaleDateString()}</p>
                    <p className="text-gray-700">{gig.seller.bio || "No bio yet."}</p>
                </div>
            </div>
          </div>

          {/* Reviews (Simple List) */}
          <div className="space-y-4">
             <h2 className="text-xl font-bold">Reviews ({gig.ratingCount})</h2>
             {(gig.reviews as any[]) && (gig.reviews as any[]).length > 0 ? (
                 (gig.reviews as any[]).map((review: any) => (
                     <div key={review.id} className="border-b pb-4">
                         <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={review.buyer.avatarUrl} />
                                <AvatarFallback>{review.buyer.username[0]}</AvatarFallback>
                            </Avatar>
                            <span className="font-bold text-sm">{review.buyer.username}</span>
                            <div className="flex text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-current" : "text-gray-300"}`} />
                                ))}
                            </div>
                         </div>
                         <p className="text-gray-600 text-sm">{review.comment}</p>
                     </div>
                 ))
             ) : (
                 <p className="text-gray-500 italic">No reviews yet.</p>
             )}
          </div>

        </div>

        {/* === RIGHT COLUMN: Sticky Pricing Card === */}
        <div className="lg:col-span-1">
            <div className="sticky top-10 space-y-6">
                
                <Card className="shadow-lg border-t-4 border-t-[#660099]">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <span className="font-bold text-gray-500">Standard Package</span>
                            <span className="text-2xl font-bold text-[#660099]">{Number(gig.basePricePi)} Pi</span>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-6 min-h-[60px]">
                            {/* Short description of package (using title for now) */}
                            {gig.title}
                        </p>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Clock className="w-4 h-4" />
                                <span>{gig.deliveryDays} Days Delivery</span>
                            </div>
                             <div className="flex items-center gap-2 text-sm text-gray-500">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span>Secure Transaction</span>
                            </div>
                        </div>

                        {/* Order Button -> Sẽ dẫn tới trang Payment */}
                        <Link href={`/checkout/${gig.id}`}>
                            <Button className="w-full bg-[#660099] hover:bg-[#52007a] text-lg font-bold py-6">
                                Continue ({Number(gig.basePricePi)} Pi)
                            </Button>
                        </Link>
                        
                        <Button variant="ghost" className="w-full mt-2 text-gray-500">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Contact Seller
                        </Button>

                    </CardContent>
                </Card>

            </div>
        </div>

      </div>
    </div>
  );
}