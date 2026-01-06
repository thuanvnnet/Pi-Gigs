import { getSellerProfile, getSellerGigs, getSellerReviews } from "@/app/actions/user";
import { notFound } from "next/navigation";
import { GigCard } from "@/components/gigs/gig-card";
import { ReviewItem } from "@/components/reviews/review-item";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Package, CheckCircle2, Calendar, MessageCircle, MapPin, Phone, Globe, Twitter, Linkedin, Facebook, Languages, Clock, User, Mail } from "lucide-react";
import { ContactSellerButton } from "@/components/messages/contact-seller-button";
import { FollowButton } from "@/components/follow/follow-button";
import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";
import { Users } from "lucide-react";

// Force dynamic để luôn lấy dữ liệu mới nhất
export const dynamic = 'force-dynamic';

interface SellerPageProps {
  params: Promise<{
    sellerId: string;
  }>;
}

export default async function SellerPage({ params }: SellerPageProps) {
  const { sellerId } = await params;
  
  const [profileResult, gigsResult, reviewsResult] = await Promise.all([
    getSellerProfile(sellerId),
    getSellerGigs(sellerId, 20, 0),
    getSellerReviews(sellerId, 10),
  ]);

  if (!profileResult.success || !profileResult.seller) {
    notFound();
  }

  const seller = profileResult.seller;
  const gigs = gigsResult.success ? gigsResult.gigs : [];
  const reviews = reviewsResult.success ? reviewsResult.reviews : [];

  const sellerRating = seller.sellerRatingAvg ? Number(seller.sellerRatingAvg).toFixed(1) : "0.0";
  const memberSince = new Date(seller.createdAt);
  const activeGigsCount = seller.activeGigsCount || 0;
  const completedOrdersCount = seller.completedOrdersCount || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Sidebar - Profile Info */}
          <aside className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Profile Card */}
              <Card className="bg-white/95 backdrop-blur-md border border-gray-200/80 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                <CardContent className="p-6 sm:p-7">
                  {/* Avatar */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative mb-5">
                      <Avatar className="h-32 w-32 border-4 border-white shadow-2xl ring-4 ring-[#31BF75]/10 transition-all duration-300 hover:ring-[#31BF75]/20">
                        <AvatarImage src={seller.avatarUrl || ""} alt={seller.username} className="object-cover" />
                        <AvatarFallback className="bg-gradient-to-br from-[#31BF75] via-[#2BA866] to-[#27995E] text-white text-4xl font-bold">
                          {seller.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {/* Online Status Indicator */}
                      <div className="absolute bottom-1 right-1 h-6 w-6 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-[#31BF75]/20">
                        <div className="h-3.5 w-3.5 bg-[#31BF75] rounded-full animate-pulse"></div>
                      </div>
                      {sellerRating !== "0.0" && (
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white rounded-full px-3 py-1.5 shadow-lg border border-amber-200/60 z-10 backdrop-blur-sm">
                          <div className="flex items-center gap-1.5">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-bold text-gray-900">{sellerRating}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center tracking-tight">{seller.username}</h1>
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-600 flex-wrap">
                      {seller.sellerReviewCount > 0 && (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50/50">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-medium">{seller.sellerReviewCount}</span>
                        </div>
                      )}
                      {activeGigsCount > 0 && (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50/50">
                          <Package className="h-3.5 w-3.5 text-blue-500" />
                          <span className="font-medium">{activeGigsCount} {activeGigsCount === 1 ? 'gig' : 'gigs'}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50/50">
                        <Calendar className="h-3.5 w-3.5 text-gray-500" />
                        <span className="font-medium">Since {format(memberSince, "MMM yyyy")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Followers & Following Stats */}
                  <div className="mb-6 pb-6 border-b border-gray-200/60">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-center flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="h-5 w-5 text-[#31BF75]" />
                          <span className="text-xl font-bold text-gray-900">{(seller.followersCount || 0).toLocaleString()}</span>
                        </div>
                        <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Followers</span>
                      </div>
                      <div className="h-10 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
                      <div className="flex flex-col items-center flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="h-5 w-5 text-gray-400" />
                          <span className="text-xl font-bold text-gray-900">{(seller.followingCount || 0).toLocaleString()}</span>
                        </div>
                        <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Following</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mb-6 flex gap-3">
                    <ContactSellerButton
                      sellerId={seller.id}
                      sellerUsername={seller.username}
                      className="flex-1"
                    />
                    <FollowButton
                      sellerId={seller.id}
                      className="flex-1"
                    />
                  </div>

                  {/* Bio */}
                  {seller.bio && (
                    <div className="mb-6 pb-6 border-b border-gray-200/60">
                      <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-[#31BF75]" />
                        About
                      </h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                        {seller.bio}
                      </p>
                    </div>
                  )}

                  {/* Skills */}
                  {seller.skills && seller.skills.length > 0 && (
                    <div className="mb-6 pb-6 border-b border-gray-200/60">
                      <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3.5 flex items-center gap-2">
                        <Package className="h-3.5 w-3.5 text-[#31BF75]" />
                        Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {seller.skills.map((skill: string, idx: number) => (
                          <Badge 
                            key={idx} 
                            className="text-xs font-semibold px-3.5 py-1.5 bg-gradient-to-br from-[#31BF75] to-[#27995E] text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact Info */}
                  {(seller.phone || seller.location || seller.website || seller.timezone) && (
                    <div className="mb-6 pb-6 border-b border-gray-200/60">
                      <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3.5 flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-[#31BF75]" />
                        Contact
                      </h3>
                      <div className="space-y-2.5">
                        {/* Location and Timezone on same row */}
                        {(seller.location || seller.timezone) && (
                          <div className="flex items-center gap-4 flex-wrap">
                            {seller.location && (
                              <div className="flex items-center gap-2 text-gray-700 text-sm px-2 py-1.5 rounded-md bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                                <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                <span className="truncate font-medium">{seller.location}</span>
                              </div>
                            )}
                            {seller.timezone && (
                              <div className="flex items-center gap-2 text-gray-700 text-sm px-2 py-1.5 rounded-md bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                                <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                <span className="truncate font-medium">{seller.timezone}</span>
                              </div>
                            )}
                          </div>
                        )}
                        {seller.phone && (
                          <div className="flex items-center gap-2 text-gray-700 text-sm px-2 py-1.5 rounded-md bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                            <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <span className="font-medium">{seller.phone}</span>
                          </div>
                        )}
                        {seller.website && (
                          <a
                            href={seller.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-[#31BF75] hover:text-[#27995E] transition-all duration-200 text-sm px-2 py-1.5 rounded-md bg-green-50/50 hover:bg-green-100/50 font-medium group"
                          >
                            <Globe className="h-4 w-4 flex-shrink-0 group-hover:rotate-12 transition-transform" />
                            <span className="truncate">Website</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {seller.languages && seller.languages.length > 0 && (
                    <div className="mb-6 pb-6 border-b border-gray-200/60">
                      <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3.5 flex items-center gap-2">
                        <Languages className="h-3.5 w-3.5 text-[#31BF75]" />
                        Languages
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {seller.languages.map((lang: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs font-medium px-3 py-1 border-gray-300 hover:border-[#31BF75] hover:bg-[#31BF75]/5 transition-all duration-200">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  {completedOrdersCount > 0 && (
                    <div className="pt-2">
                      <div className="flex items-center gap-2.5 text-[#31BF75] font-semibold text-sm px-3 py-2 rounded-lg bg-green-50/50 border border-green-100/50">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{completedOrdersCount} completed order{completedOrdersCount > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Right Column - Gigs & Reviews */}
          <div className="lg:col-span-2 space-y-8">

            {/* Seller Gigs */}
            {gigs.length > 0 ? (
              <div>
                <div className="mb-7">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                    {seller.username}'s Gigs
                  </h2>
                  <p className="text-sm text-gray-600 font-medium">{gigs.length} active gig{gigs.length > 1 ? "s" : ""}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  {gigs.map((gig: any) => (
                    <GigCard key={gig.id} gig={gig} />
                  ))}
                </div>
              </div>
            ) : (
              <Card className="bg-white/95 backdrop-blur-md border border-gray-200/80 shadow-xl">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
                    <Package className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No gigs yet</h3>
                  <p className="text-sm text-gray-600">
                    This seller hasn't created any gigs yet.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Seller Reviews */}
            {reviews.length > 0 && (
              <Card className="bg-white/95 backdrop-blur-md border border-gray-200/80 shadow-xl">
                <CardContent className="p-6 sm:p-7">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7 pb-6 border-b border-gray-200/60">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                        Reviews
                      </h2>
                      <p className="text-sm text-gray-600 font-medium">{reviews.length} review{reviews.length > 1 ? "s" : ""}</p>
                    </div>
                    {sellerRating !== "0.0" && (
                      <div className="flex items-center gap-3 bg-gradient-to-br from-amber-50 to-amber-100/60 px-4 py-3 rounded-xl border border-amber-200/60 shadow-sm">
                        <div className="flex items-center gap-1.5">
                          <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                          <span className="text-2xl font-bold text-gray-900">{sellerRating}</span>
                        </div>
                        <div className="h-7 w-px bg-amber-200/70"></div>
                        <span className="text-sm text-gray-700 font-semibold">
                          {seller.sellerReviewCount || 0} total
                        </span>
                      </div>
                    )}
                  </div>
              <div className="space-y-6">
                {reviews.map((review: any) => (
                  <div key={review.id} className="pb-6 last:pb-0 border-b border-gray-200/60 last:border-0">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12 flex-shrink-0 border-2 border-gray-200 shadow-sm">
                        <AvatarImage src={review.buyer.avatarUrl || ""} alt={review.buyer.username} />
                        <AvatarFallback className="bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 text-sm font-semibold">
                          {review.buyer.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <span className="font-bold text-gray-900 text-base">{review.buyer.username}</span>
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                                  />
                                ))}
                              </div>
                            </div>
                            {review.gig && (
                              <Link
                                href={`/gigs/${review.gig.slug || review.gig.id}`}
                                className="text-sm text-[#31BF75] hover:text-[#27995E] font-medium transition-colors inline-flex items-center gap-1.5 group"
                              >
                                <Package className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                                <span className="truncate max-w-[250px]">{review.gig.title}</span>
                              </Link>
                            )}
                          </div>
                          {review.createdAt && (
                            <span className="text-xs text-gray-500 whitespace-nowrap font-medium">
                              {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                        {review.comment && (
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-4 text-sm">{review.comment}</p>
                        )}
                        {review.sellerReply && (
                          <div className="mt-4 pl-4 border-l-3 border-[#31BF75] bg-gradient-to-r from-teal-50/70 to-transparent rounded-r-lg p-4 shadow-sm">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex items-center gap-2">
                                <MessageCircle className="h-4 w-4 text-[#31BF75]" />
                                <span className="text-xs font-bold text-[#31BF75] uppercase tracking-wide">Seller's Reply</span>
                              </div>
                              {review.sellerReplyAt && (
                                <span className="text-xs text-gray-500 font-medium">
                                  {formatDistanceToNow(new Date(review.sellerReplyAt), { addSuffix: true })}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{review.sellerReply}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
