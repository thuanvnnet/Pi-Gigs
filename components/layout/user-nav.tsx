"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import { LogOut, User, CreditCard, LayoutDashboard } from "lucide-react";

export function UserNav() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    // Refresh trang hoặc đẩy về Home để đảm bảo xóa sạch state
    router.push("/");
    router.refresh();
  };

  // Nếu chưa đăng nhập thì không hiện gì (hoặc hiện nút Login ở nơi khác)
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full">
          <Avatar className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 border border-gray-200">
            <AvatarImage src={user.avatarUrl || ""} alt={user.username} />
            <AvatarFallback className="bg-[#31BF75] text-white font-bold text-xs sm:text-sm">
              {user.username[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {/* Online Status Indicator - No animation */}
          <span 
            className="absolute bottom-0 right-0 h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 bg-[#31BF75] border-2 border-white rounded-full shadow-sm"
            aria-label="Online"
            title="Online"
          />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none">{user.username}</p>
              <span 
                className="h-2 w-2 bg-[#31BF75] rounded-full"
                aria-label="Online"
                title="Online"
              />
            </div>
            <p className="text-xs leading-none text-muted-foreground">
              Balance: <span className="text-[#31BF75] font-bold">{Number(user.walletBalance).toFixed(2)} Pi</span>
            </p>
            <p className="text-xs leading-none text-[#31BF75] font-medium mt-1 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-[#31BF75] rounded-full" />
              Online
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/dashboard/create-gig")}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Seller Dashboard</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/dashboard/orders")}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>My Orders</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}