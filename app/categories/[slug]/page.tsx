import { getCategoryBySlug, getGigsByCategory } from "@/app/actions/category";
import { GigCard } from "@/components/gigs/gig-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Palette, TrendingUp, Globe, Play, Music, Code, Briefcase, ShoppingBag, ArrowLeft } from "lucide-react";

// Force dynamic để luôn lấy dữ liệu mới nhất
export const dynamic = 'force-dynamic';

// Category icons mapping (same as homepage)
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

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const gigs = await getGigsByCategory(category.id, 50, 0);

  const Icon = categoryIcons[category.name] || Briefcase;
  const colorClass = categoryColors[category.name] || "bg-gray-100 text-gray-600";
  const gigCount = category._count?.gigs || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/categories">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Button>
        </Link>

        {/* Category Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Icon */}
            <div className={`w-24 h-24 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0`}>
              <Icon className="h-12 w-12" />
            </div>

            {/* Category Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
                {category.parent && (
                  <Link
                    href={`/categories/${category.parent.slug}`}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    (in {category.parent.name})
                  </Link>
                )}
              </div>
              <p className="text-lg text-gray-600 mb-4">
                {gigCount} {gigCount === 1 ? 'gig' : 'gigs'} available in this category
              </p>

              {/* Subcategories (if any) */}
              {category.children && category.children.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-500 font-medium">Subcategories:</span>
                  {category.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/categories/${child.slug}`}
                      className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gigs Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {gigs.length > 0 ? `All Gigs in ${category.name}` : `No Gigs in ${category.name}`}
            </h2>
          </div>

          {gigs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-200">
              <div className={`w-16 h-16 rounded-full ${colorClass} flex items-center justify-center mx-auto mb-4`}>
                <Icon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium text-gray-500 mb-2">No gigs available yet.</h3>
              <p className="text-sm text-gray-400 mb-6">Be the first seller in this category!</p>
              <Link href="/dashboard/create-gig">
                <Button className="bg-green-600 hover:bg-green-700">Create a Gig</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {gigs.map((gig: any) => (
                <GigCard key={gig.id} gig={gig} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
