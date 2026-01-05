// components/home/testimonials.tsx
"use client";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    quote: "I was struggling with my Node setup for weeks. Found a seller here who fixed it in 30 minutes via TeamViewer. Worth every Pi!",
    author: "David Nguyen",
    role: "PI NODE OPERATOR",
    rating: 5,
  },
  {
    quote: "The quality of freelancers on 5.pi Gigs is surprisingly good. I paid 50 Pi for a full branding kit and it looks professional.",
    author: "Sarah Jenkins",
    role: "DIGITAL MARKETER",
    rating: 5,
  },
  {
    quote: "Great platform to earn extra Pi. The Escrow system makes me feel safe when working with new clients. Highly recommended!",
    author: "Michael Chen",
    role: "APP DEVELOPER",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-green-50 rounded-full border border-green-200 mb-3">
            <span className="text-sm font-semibold text-green-700 uppercase tracking-wide">Community Love</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Trusted by Pi Pioneers</h2>
          <p className="text-lg text-gray-600">See what our community has to say about their experience on 5.pi Gigs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <article
              key={index}
              className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm"
            >
              <div className="flex gap-1 mb-4" role="img" aria-label={`${testimonial.rating} out of 5 stars`}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <blockquote>
                <p className="text-gray-700 mb-6 leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
              </blockquote>
              <footer>
                <p className="font-semibold text-gray-900">{testimonial.author}</p>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

