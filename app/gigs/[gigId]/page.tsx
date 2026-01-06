// app/gigs/[gigId]/page.tsx
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Clock, 
  CheckCircle2, 
  MessageCircle, 
  Shield, 
  TrendingUp,
  Calendar,
  ArrowLeft,
  ImageIcon
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ReviewItem } from "@/components/reviews/review-item";
import { ContactSellerButton } from "@/components/messages/contact-seller-button";

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
        take: 10,
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

  // Count completed orders separately
  const completedOrdersCount = await prisma.order.count({
    where: {
      gigId: gigId,
      status: "COMPLETED",
    },
  });

  return {
    ...gig,
    _count: {
      orders: completedOrdersCount,
    },
  };
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

  const images = (gig.images as string[]) || [];
  const price = Number(gig.basePricePi);
  const rating = gig.ratingAvg ? Number(gig.ratingAvg).toFixed(1) : "0.0";
  const sellerRating = gig.seller.sellerRatingAvg 
    ? Number(gig.seller.sellerRatingAvg).toFixed(1) 
    : "0.0";
  const completedSales = gig._count.orders;
  const deliveryDays = gig.deliveryDays || 3;
  const memberSince = new Date(gig.seller.createdAt);
  const gigCreatedAt = new Date(gig.createdAt);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* === LEFT COLUMN: Content === */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Breadcrumb & Title */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <Link href="/" className="hover:text-[#31BF75] transition-colors">Home</Link>
                <span>/</span>
                {gig.category && (
                  <>
                    <Link href="#" className="hover:text-[#31BF75] transition-colors">{gig.category.name}</Link>
                    <span>/</span>
                  </>
                )}
                <span className="text-gray-900 font-medium">Gig Details</span>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-6">
                {gig.title}
              </h1>
              
              {/* Seller Info Header */}
              <div className="flex items-center gap-4 pb-6 border-b">
                <Avatar className="h-14 w-14 border-2 border-gray-100">
                  <AvatarImage src={gig.seller.avatarUrl || ""} alt={gig.seller.username} />
                  <AvatarFallback className="bg-gradient-to-br from-[#31BF75] to-[#27995E] text-white text-lg font-bold">
                    {gig.seller.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Link 
                      href={`/seller/${gig.seller.id}`}
                      className="font-bold text-lg text-gray-900 hover:text-[#31BF75] transition-colors"
                    >
                      {gig.seller.username}
                    </Link>
                    {sellerRating !== "0.0" && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-gray-900">{sellerRating}</span>
                        <span className="text-gray-500">
                          ({gig.seller.sellerReviewCount || 0})
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                    {completedSales > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="font-medium">{completedSales} completed orders</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>Member since {memberSince.getFullYear()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border">
              {images.length > 0 ? (
                <div className="relative">
                  {/* Main Image */}
                  <div className="relative aspect-video w-full bg-gray-100">
                    <Image 
                      src={images[0]} 
                      alt={gig.title} 
                      fill 
                      className="object-cover"
                      priority
                      sizes="(max-width: 1024px) 100vw, 66vw"
                    />
                  </div>
                  
                  {/* Thumbnail Grid (if more than 1 image) */}
                  {images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2 p-4 bg-gray-50 border-t">
                      {images.slice(1, 5).map((img, idx) => (
                        <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border-2 border-transparent hover:border-[#31BF75] transition-colors cursor-pointer">
                          <Image 
                            src={img} 
                            alt={`${gig.title} - Image ${idx + 2}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 25vw, 16vw"
                          />
                        </div>
                      ))}
                      {images.length > 5 && (
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-600">
                            +{images.length - 5}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <ImageIcon className="w-16 h-16 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-500 font-medium">No images available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Stats & Trust Signals */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center p-4 border-2 border-gray-100">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span className="text-2xl font-bold text-gray-900">{rating}</span>
                </div>
                <p className="text-xs text-gray-600">Rating</p>
                <p className="text-xs text-gray-500 mt-1">({gig.ratingCount} reviews)</p>
              </Card>
              
              <Card className="text-center p-4 border-2 border-gray-100">
                <Clock className="w-5 h-5 mx-auto mb-2 text-[#31BF75]" />
                <p className="text-2xl font-bold text-gray-900">{deliveryDays}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {deliveryDays === 1 ? "Day" : "Days"} Delivery
                </p>
              </Card>
              
              <Card className="text-center p-4 border-2 border-gray-100">
                <TrendingUp className="w-5 h-5 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold text-gray-900">{completedSales}</p>
                <p className="text-xs text-gray-600 mt-1">Completed</p>
              </Card>
              
              <Card className="text-center p-4 border-2 border-gray-100">
                <CheckCircle2 className="w-5 h-5 mx-auto mb-2 text-green-600" />
                <p className="text-xs font-semibold text-gray-900">Secure</p>
                <p className="text-xs text-gray-600 mt-1">Payment</p>
              </Card>
            </div>

            {/* Description */}
            <Card className="shadow-sm">
              <CardContent className="p-6 lg:p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">About this Gig</h2>
                <div className="prose max-w-none text-gray-700 whitespace-pre-line leading-relaxed text-base">
                  {gig.description || "No description available."}
                </div>
              </CardContent>
            </Card>

            {/* Seller Bio */}
            <Card className="shadow-sm">
              <CardContent className="p-6 lg:p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">About the Seller</h2>
                <div className="flex gap-6">
                  <Avatar className="h-20 w-20 border-2 border-gray-200 flex-shrink-0">
                    <AvatarImage src={gig.seller.avatarUrl || ""} alt={gig.seller.username} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-[#31BF75] to-[#27995E] text-white">
                      {gig.seller.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <h3 className="font-bold text-xl text-gray-900">{gig.seller.username}</h3>
                      {sellerRating !== "0.0" && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="font-semibold">{sellerRating}</span>
                          <span className="text-gray-500">
                            ({gig.seller.sellerReviewCount || 0})
                          </span>
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mb-3 text-sm text-gray-600 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>Member since {memberSince.toLocaleDateString("en-US", { year: "numeric", month: "long" })}</span>
                      </div>
                      {completedSales > 0 && (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="font-medium">{completedSales} orders completed</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {gig.seller.bio || "This seller hasn't added a bio yet."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card className="shadow-sm">
              <CardContent className="p-6 lg:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {gig.ratingCount} {gig.ratingCount === 1 ? "review" : "reviews"} from buyers
                    </p>
                  </div>
                  {gig.ratingCount > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                      <span className="text-2xl font-bold text-gray-900">{rating}</span>
                    </div>
                  )}
                </div>
                
                {gig.reviews && gig.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {(gig.reviews as any[]).map((review: any) => (
                      <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage src={review.buyer.avatarUrl || ""} alt={review.buyer.username} />
                            <AvatarFallback className="bg-gray-200 text-gray-700">
                              {review.buyer.username[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <span className="font-semibold text-gray-900">{review.buyer.username}</span>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-4 h-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} 
                                  />
                                ))}
                              </div>
                              {review.createdAt && (
                                <span className="text-xs text-gray-500">
                                  {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                                </span>
                              )}
                            </div>
                            {review.comment && (
                              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 font-medium mb-2">No reviews yet</p>
                    <p className="text-sm text-gray-500">Be the first to leave a review!</p>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* === RIGHT COLUMN: Sticky Pricing Card === */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              
              {/* Main Pricing Card */}
              <Card className="shadow-xl border-2 border-[#31BF75]/20 bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-6">
                  {/* Price Header */}
                  <div className="text-center mb-6 pb-6 border-b border-gray-200">
                    <p className="text-sm text-gray-600 mb-2 font-medium">Starting at</p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold text-[#31BF75]">{price.toFixed(2)}</span>
                      <span className="text-xl font-semibold text-[#31BF75]">π</span>
                    </div>
                  </div>

                  {/* Trust Signals */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-green-900">Secure Payment</p>
                        <p className="text-xs text-green-700">Protected by Pi Network</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-blue-900">{deliveryDays}-Day Delivery</p>
                        <p className="text-xs text-blue-700">Fast turnaround time</p>
                      </div>
                    </div>

                    {completedSales > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <TrendingUp className="w-5 h-5 text-purple-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-purple-900">{completedSales} Orders Completed</p>
                          <p className="text-xs text-purple-700">Proven track record</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Main CTA */}
                  <Link href={`/checkout/${gig.id}`} className="block mb-3">
                    <Button 
                      size="lg" 
                      className="w-full bg-gradient-to-r from-[#31BF75] to-[#27995E] hover:from-[#27995E] hover:to-[#207C4C] text-lg font-bold py-7 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Order Now
                      <span className="ml-2 opacity-90">({price.toFixed(2)} π)</span>
                    </Button>
                  </Link>
                  
                  {/* Secondary CTA */}
                  <ContactSellerButton
                    sellerId={gig.seller.id}
                    sellerUsername={gig.seller.username}
                    className="w-full border-2 text-gray-700 hover:bg-gray-50 font-medium"
                  />

                  {/* Additional Info */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                      <Shield className="w-4 h-4" />
                      <span>Money-back guarantee</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats Card */}
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-4 text-sm">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Response Time</span>
                      <span className="font-semibold text-gray-900">Within 24h</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Delivery</span>
                      <span className="font-semibold text-gray-900">{deliveryDays} {deliveryDays === 1 ? "day" : "days"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-gray-900">{rating}</span>
                      </div>
                    </div>
                    {completedSales > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Orders</span>
                        <span className="font-semibold text-gray-900">{completedSales}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
