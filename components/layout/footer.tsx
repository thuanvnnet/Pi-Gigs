// components/layout/footer.tsx
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <img src="/logo.svg" alt="Logo" className="h-12 w-auto object-contain mb-3" />
            <p className="text-sm text-gray-600 leading-relaxed">
              The Pi Network marketplace for small tasks and big opportunities.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Categories</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/?category=1" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                  Design
                </Link>
              </li>
              <li>
                <Link href="/?category=2" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                  Writing
                </Link>
              </li>
              <li>
                <Link href="/?category=3" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                  Programming
                </Link>
              </li>
              <li>
                <Link href="/?category=4" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                  Marketing
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                  Trust & Safety
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                  Seller Guide
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Community</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                  About Pi Network
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                  Success Stories
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                  Invite Friends
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            © 2025 5.pi Gigs. Built on Pi Network. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

