import { getCategories } from "@/app/actions/category";
import Link from "next/link";
import { Palette, TrendingUp, Globe, Play, Music, Code, Briefcase, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";

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

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Browse All Categories</h1>
          <p className="text-lg text-gray-600">
            Explore services across all categories to find exactly what you need
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-200">
            <h3 className="text-lg font-medium text-gray-500 mb-2">No categories available yet.</h3>
            <p className="text-sm text-gray-400">Categories will appear here once they are created.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const Icon = categoryIcons[category.name] || Briefcase;
              const colorClass = categoryColors[category.name] || "bg-gray-100 text-gray-600";
              const gigCount = category._count?.gigs || 0;

              return (
                <Link key={category.id} href={`/categories/${category.slug}`}>
                  <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group h-full">
                    <div className="flex flex-col items-center text-center gap-4">
                      {/* Icon */}
                      <div className={`w-20 h-20 rounded-full ${colorClass} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className="h-10 w-10" />
                      </div>

                      {/* Category Name */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                          {category.name}
                        </h3>
                        
                        {/* Gig Count */}
                        <p className="text-sm text-gray-500">
                          {gigCount} {gigCount === 1 ? 'gig' : 'gigs'} available
                        </p>
                      </div>

                      {/* Children Categories (if any) */}
                      {category.children && category.children.length > 0 && (
                        <div className="w-full pt-4 border-t border-gray-100">
                          <p className="text-xs text-gray-500 mb-2 font-medium">Subcategories:</p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {category.children.slice(0, 3).map((child) => (
                              <Link
                                key={child.id}
                                href={`/categories/${child.slug}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                              >
                                {child.name}
                              </Link>
                            ))}
                            {category.children.length > 3 && (
                              <span className="text-xs text-gray-400">
                                +{category.children.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
