"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { getOrders } from "@/app/actions/order";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Loader2,
  Package,
  ShoppingBag,
  ArrowRight,
  Search,
  Filter,
  Check,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Order = {
  id: string;
  status: string;
  amountPi: string;
  createdAt: string;
  gig: {
    id: string;
    title: string;
    slug: string;
    images: string[];
  };
  buyer: {
    username: string;
    avatarUrl: string | null;
  };
  seller: {
    username: string;
    avatarUrl: string | null;
  };
  payment: {
    status: string;
    txid: string | null;
  } | null;
};

const statusConfig: Record<
  string,
  { label: string; color: string; bgColor: string; icon: React.ElementType }
> = {
  CREATED: {
    label: "Created",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
    icon: Clock,
  },
  AWAITING_PAYMENT: {
    label: "Awaiting Payment",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    icon: AlertCircle,
  },
  PAID: {
    label: "Paid",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: CheckCircle2,
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "text-teal-700",
    bgColor: "bg-teal-100",
    icon: Sparkles,
  },
  DELIVERED: {
    label: "Delivered",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: Package,
  },
  COMPLETED: {
    label: "Completed",
    color: "text-green-800",
    bgColor: "bg-green-200",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: XCircle,
  },
  DISPUTED: {
    label: "Disputed",
    color: "text-orange-700",
    bgColor: "bg-orange-100",
    icon: AlertCircle,
  },
};

const ALL_STATUSES = "ALL";
const ALL_ROLES = "ALL";

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(ALL_STATUSES);
  const [roleFilter, setRoleFilter] = useState<string>(ALL_ROLES);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/");
      return;
    }

    loadOrders();
  }, [user, authLoading]);

  const loadOrders = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getOrders(user.id);
      if (result.success) {
        setOrders(result.orders as Order[]);
      } else {
        setError(result.error || "Failed to load orders");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Filter and search logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const isBuyer = order.buyer.username === user?.username;
      const otherParty = isBuyer ? order.seller : order.buyer;

      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        order.gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        otherParty.username.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === ALL_STATUSES || order.status === statusFilter;

      // Role filter
      const matchesRole =
        roleFilter === ALL_ROLES ||
        (roleFilter === "BUYING" && isBuyer) ||
        (roleFilter === "SELLING" && !isBuyer);

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [orders, searchQuery, statusFilter, roleFilter, user]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const buyingOrders = orders.filter((o) => o.buyer.username === user?.username);
    const sellingOrders = orders.filter((o) => o.seller.username === user?.username);
    const totalSpent = buyingOrders.reduce((sum, o) => sum + Number(o.amountPi), 0);
    const totalEarned = sellingOrders.reduce((sum, o) => sum + Number(o.amountPi), 0);
    const completedOrders = orders.filter((o) => o.status === "COMPLETED").length;

    return { totalOrders, buyingOrders: buyingOrders.length, sellingOrders: sellingOrders.length, totalSpent, totalEarned, completedOrders };
  }, [orders, user]);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#31BF75]" />
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">View and manage all your orders</p>
        </div>

      {/* Statistics Cards */}
      {orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1 font-medium">Total Orders</p>
                  <p className="text-3xl font-bold text-[#31BF75]">{stats.totalOrders}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#31BF75]/5">
                  <Package className="h-8 w-8 text-[#31BF75]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1 font-medium">Total Spent</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalSpent.toFixed(2)} Pi</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50">
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1 font-medium">Total Earned</p>
                  <p className="text-3xl font-bold text-green-600">{stats.totalEarned.toFixed(2)} Pi</p>
                </div>
                <div className="p-3 rounded-xl bg-green-50">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/80 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1 font-medium">Completed</p>
                  <p className="text-3xl font-bold text-teal-600">{stats.completedOrders}</p>
                </div>
                <div className="p-3 rounded-xl bg-teal-50">
                  <CheckCircle2 className="h-8 w-8 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      {orders.length > 0 && (
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
              <Input
                placeholder="Search orders by gig title or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-[#31BF75] transition-colors"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto bg-white border-gray-200 hover:bg-gray-50 hover:border-[#31BF75]">
                  <Filter className="mr-2 h-4 w-4" />
                  Status: {statusFilter === ALL_STATUSES ? "All" : statusConfig[statusFilter]?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white/98 backdrop-blur-sm border-gray-200 shadow-lg">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter(ALL_STATUSES)}>
                  <span className="flex-1">All Statuses</span>
                  {statusFilter === ALL_STATUSES && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
                {Object.entries(statusConfig).map(([status, config]) => (
                  <DropdownMenuItem key={status} onClick={() => setStatusFilter(status)}>
                    <span className="flex-1">{config.label}</span>
                    {statusFilter === status && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto bg-white border-gray-200 hover:bg-gray-50 hover:border-[#31BF75]">
                  <Package className="mr-2 h-4 w-4" />
                  {roleFilter === ALL_ROLES
                    ? "All Orders"
                    : roleFilter === "BUYING"
                      ? "Buying"
                      : "Selling"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-white/98 backdrop-blur-sm border-gray-200 shadow-lg">
                <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setRoleFilter(ALL_ROLES)}>
                  <span className="flex-1">All Orders</span>
                  {roleFilter === ALL_ROLES && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRoleFilter("BUYING")}>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  <span className="flex-1">Buying</span>
                  {roleFilter === "BUYING" && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRoleFilter("SELLING")}>
                  <Package className="mr-2 h-4 w-4" />
                  <span className="flex-1">Selling</span>
                  {roleFilter === "SELLING" && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Results Count */}
      {orders.length > 0 && (
        <div className="mb-4 text-sm text-gray-600 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 w-fit border border-gray-200">
          Showing {filteredOrders.length} of {orders.length} order{orders.length !== 1 ? "s" : ""}
        </div>
      )}

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-20">
            {orders.length === 0 ? (
              <>
                <div className="p-4 rounded-xl bg-[#31BF75]/5 mb-4">
                  <Package className="h-16 w-16 text-[#31BF75]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h3>
                <p className="text-gray-500 mb-6 text-center max-w-md">
                  Start shopping to see your orders here. Browse amazing gigs from talented sellers
                  on Pi Network!
                </p>
                <Link href="/">
                  <Button size="lg" className="bg-[#31BF75] hover:bg-[#27995E] text-white">
                    Browse Gigs
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <div className="p-4 rounded-xl bg-gray-100 mb-4">
                  <Search className="h-16 w-16 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search query</p>
                <Button
                  variant="outline"
                  className="bg-white border-gray-200 hover:bg-gray-50"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter(ALL_STATUSES);
                    setRoleFilter(ALL_ROLES);
                  }}
                >
                  Clear Filters
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isBuyer = order.buyer.username === user.username;
            const otherParty = isBuyer ? order.seller : order.buyer;
            const statusInfo = statusConfig[order.status] || statusConfig.CREATED;
            const StatusIcon = statusInfo.icon;

            return (
              <Card
                key={order.id}
                className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group"
              >
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-3">
                        {order.gig.images && order.gig.images.length > 0 && (
                          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                            <Image
                              src={order.gig.images[0]}
                              alt={order.gig.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg sm:text-xl mb-2">
                            <Link
                              href={`/gigs/${order.gig.id}`}
                              className="hover:text-[#31BF75] transition-colors line-clamp-2 text-gray-900"
                            >
                              {order.gig.title}
                            </Link>
                          </CardTitle>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1.5">
                              {isBuyer ? (
                                <>
                                  <div className="p-1 rounded bg-blue-50">
                                    <ShoppingBag className="h-3.5 w-3.5 text-blue-600" />
                                  </div>
                                  <span>Buying from</span>
                                </>
                              ) : (
                                <>
                                  <div className="p-1 rounded bg-green-50">
                                    <Package className="h-3.5 w-3.5 text-green-600" />
                                  </div>
                                  <span>Selling to</span>
                                </>
                              )}
                              <span className="font-semibold text-gray-900">
                                {otherParty.username}
                              </span>
                            </span>
                            <span className="hidden sm:inline text-gray-300">•</span>
                            <span className="text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge
                      className={`${statusInfo.bgColor} ${statusInfo.color} border-0 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium w-fit`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {statusInfo.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs text-gray-500 mb-1 font-medium">Amount</p>
                        <p className="text-2xl font-bold text-[#31BF75]">
                          {Number(order.amountPi).toFixed(2)} Pi
                        </p>
                      </div>
                      {order.payment?.txid && (
                        <div className="hidden sm:block bg-gray-50/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-200">
                          <p className="text-xs text-gray-500 mb-1 font-medium">Transaction</p>
                          <p className="text-xs font-mono text-gray-700 break-all max-w-[200px]">
                            {order.payment.txid.slice(0, 20)}...
                          </p>
                        </div>
                      )}
                    </div>
                    <Link href={`/dashboard/orders/${order.id}`} className="w-full sm:w-auto">
                      <Button 
                        variant="outline" 
                        className="w-full sm:w-auto bg-white border-gray-200 hover:bg-gray-50 hover:border-[#31BF75]"
                      >
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}