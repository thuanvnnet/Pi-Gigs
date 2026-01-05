// app/page.tsx
import prisma from "@/lib/prisma";
import { GigCard } from "@/components/gigs/gig-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Palette, TrendingUp, Globe, Play, Music, Code, Briefcase, ShoppingBag, UserPlus, Wallet, CheckCircle, Search } from "lucide-react";
import { SearchBar } from "@/components/home/search-bar";
import { Testimonials } from "@/components/home/testimonials";

// Force dynamic để luôn lấy dữ liệu mới nhất
export const dynamic = 'force-dynamic';

async function getGigs() {
  try {
    const gigs = await prisma.gig.findMany({
      where: {
        status: "ACTIVE",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 12, // Limit for featured section
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

async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
      take: 8,
    });
    return categories;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

// Category icons mapping
const categoryIcons: Record<string, any> = {
  "Graphics & Design": Palette,
  "Digital Marketing": TrendingUp,
  "Writing & Translation": Globe,
  "Video & Animation": Play,
  "Music & Audio": Music,
  "Programming & Tech": Code,
  "Business": Briefcase,
  "Lifestyle": ShoppingBag,
};

const categoryColors: Record<string, string> = {
  "Graphics & Design": "bg-pink-100 text-pink-600",
  "Digital Marketing": "bg-orange-100 text-orange-600",
  "Writing & Translation": "bg-green-100 text-green-600",
  "Video & Animation": "bg-teal-100 text-teal-600",
  "Music & Audio": "bg-red-100 text-red-600",
  "Programming & Tech": "bg-blue-100 text-blue-600",
  "Business": "bg-cyan-100 text-cyan-600",
  "Lifestyle": "bg-teal-100 text-teal-600",
};

export default async function Home() {
  const gigs = await getGigs();
  const categories = await getCategories();

  return (
    <>
      {/* HERO SECTION */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto">
            {/* Live on Pi Network Badge */}
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-green-50 rounded-full border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">Live on Pi Network</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Small Tasks. <span className="text-gray-900">Big Network.</span>
            </h1>
            
            {/* Tagline */}
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Connect with millions of Pi users. Get work done or earn Pi today. Starting at just 5 Pi.
            </p>

            {/* Search Bar */}
            <SearchBar />

            {/* Popular Searches */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="text-sm text-gray-500 font-medium">Popular:</span>
              {["Logo Design", "Writing", "Translation", "Pi App", "Video Editing", "Marketing"].map((item) => (
                <Link
                  key={item}
                  href={`/?search=${encodeURIComponent(item)}`}
                  className="px-4 py-2 text-base bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-full border border-gray-200 transition-colors"
                  aria-label={`Search for ${item}`}
                >
                  {item}
                </Link>
              ))}
            </div>
            </div>
        </div>
      </div>

      {/* BROWSE BY CATEGORY */}
      <div className="bg-white border-b border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Browse by Category</h2>
            <Link href="/categories" className="text-green-600 hover:text-green-700 font-semibold flex items-center gap-1">
              View All Gigs <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {categories.slice(0, 8).map((category) => {
              const Icon = categoryIcons[category.name] || Briefcase;
              const colorClass = categoryColors[category.name] || "bg-gray-100 text-gray-600";
              
              return (
                <Link 
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="flex flex-col items-center gap-3 p-6 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className={`w-16 h-16 rounded-full ${colorClass} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 text-center">{category.name}</span>
                </Link>
              );
            })}
          </div>
            </div>
      </div>

      {/* FEATURED GIGS */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Featured Gigs</h2>
            <p className="text-lg text-gray-600">Hand-picked services with excellent quality and value</p>
        </div>

        {gigs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-200">
              <h3 className="text-lg font-medium text-gray-500 mb-2">No gigs available yet.</h3>
              <p className="text-sm text-gray-400 mb-6">Be the first seller on Pi-Gigs!</p>
                <Link href="/dashboard/create-gig">
                <Button className="bg-green-600 hover:bg-green-700">Create a Gig</Button>
                </Link>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {gigs.map((gig: any) => (
                    <GigCard key={gig.id} gig={gig as any} />
                ))}
            </div>
        )}
      </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="bg-white py-16 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-lg text-gray-600">Getting work done on 5.pi Gigs is simple, safe, and powered by the Pi Network blockchain</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <UserPlus className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Account</h3>
              <p className="text-base text-gray-600 leading-relaxed">Join the Pi Network community and setup your profile for free.</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <Search className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Find Services</h3>
              <p className="text-base text-gray-600 leading-relaxed">Search for gigs or browse categories to find exactly what you need.</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <Wallet className="h-10 w-10 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Pay with Pi</h3>
              <p className="text-base text-gray-600 leading-relaxed">Secure payment using Pi Coin. Funds are held in Escrow until you are satisfied.</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <CheckCircle className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Work Done</h3>
              <p className="text-base text-gray-600 leading-relaxed">Receive files, approve delivery, and leave a 5-star review for the seller.</p>
            </div>
          </div>
        </div>
      </div>

      {/* TESTIMONIALS / COMMUNITY LOVE */}
      <Testimonials />

      {/* CTA SECTION */}
      <div className="bg-green-700 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Join the Future of Work</h2>
          <p className="text-xl text-green-50 mb-8 max-w-2xl mx-auto">
            Ready to turn your skills into Pi Coin?
          </p>
          <p className="text-lg text-green-100 mb-10 max-w-2xl mx-auto">
            Join thousands of freelancers connecting with the Pi Network community. Zero upfront fees. Secure payments. Global reach.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard/create-gig">
              <Button size="lg" className="bg-white text-green-700 hover:bg-gray-50 font-semibold px-8 py-6 text-lg">
                Become a Seller →
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-6 text-lg">
                Browse Services
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
