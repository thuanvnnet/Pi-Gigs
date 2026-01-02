// app/checkout/[gigId]/page.tsx
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckoutButton } from "@/components/checkout/checkout-button";

type Props = {
  params: Promise<{ gigId: string }>;
};

export default async function CheckoutPage({ params }: Props) {
  const { gigId } = await params;

  // Fetch Gig Data
  const gig = await prisma.gig.findUnique({
    where: { id: gigId },
    include: { seller: true },
  });

  if (!gig) return notFound();

  // Tính phí dịch vụ (Ví dụ: 2% hoặc 0 Pi)
  const serviceFee = 0; 
  const total = Number(gig.basePricePi) + serviceFee;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Checkout Review</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* LEFT: Order Details */}
            <div className="md:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-4">
                        <div className="relative w-24 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                            {gig.images && (gig.images as string[]).length > 0 && (
                                <Image src={(gig.images as string[])[0]} alt={gig.title} fill className="object-cover" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">{gig.title}</h3>
                            <p className="text-sm text-gray-500">Seller: {gig.seller.username}</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="font-bold mb-4">Payment Method</h3>
                    <div className="flex items-center gap-3 p-4 border rounded-lg bg-slate-50 border-[#660099]/30">
                        <div className="w-8 h-8 rounded-full bg-[#660099] text-white flex items-center justify-center font-bold">π</div>
                        <div>
                            <p className="font-bold text-gray-900">Pi Network Wallet</p>
                            <p className="text-xs text-gray-500">Fast and secure blockchain payment</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT: Price Breakdown & Action */}
            <div className="md:col-span-1">
                <Card className="sticky top-4">
                    <CardHeader className="bg-gray-50 border-b">
                        <CardTitle className="text-lg">Price Details</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">{Number(gig.basePricePi)} Pi</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Service Fee</span>
                            <span className="font-medium">{serviceFee} Pi</span>
                        </div>
                        <div className="border-t pt-4 flex justify-between items-center">
                            <span className="font-bold text-lg">Total</span>
                            <span className="font-bold text-xl text-[#660099]">{total} Pi</span>
                        </div>

                        {/* Nút thanh toán Client Component */}
                        <div className="pt-4">
                            <CheckoutButton gigId={gig.id} price={total} />
                        </div>
                        
                        <p className="text-xs text-center text-gray-400 mt-4">
                            By clicking button above, you agree to our Terms of Service.
                        </p>
                    </CardContent>
                </Card>
            </div>

        </div>
      </div>
    </div>
  );
}