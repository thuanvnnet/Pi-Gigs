"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { followSeller, unfollowSeller, checkFollowStatus } from "@/app/actions/follow";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  sellerId: string;
  className?: string;
}

export function FollowButton({ sellerId, className }: FollowButtonProps) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (user?.id && sellerId) {
      checkStatus();
    } else {
      setChecking(false);
    }
  }, [user?.id, sellerId]);

  const checkStatus = async () => {
    if (!user?.id) return;

    setChecking(true);
    try {
      const result = await checkFollowStatus(user.id, sellerId);
      if (result.success) {
        setIsFollowing(result.isFollowing);
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
    } finally {
      setChecking(false);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      alert("Please login to follow this seller");
      return;
    }

    if (user.id === sellerId) {
      return; // Cannot follow yourself
    }

    setLoading(true);
    try {
      if (isFollowing) {
        const result = await unfollowSeller(user.id, sellerId);
        if (result.success) {
          setIsFollowing(false);
        } else {
          alert(result.error || "Failed to unfollow");
        }
      } else {
        const result = await followSeller(user.id, sellerId);
        if (result.success) {
          setIsFollowing(true);
        } else {
          alert(result.error || "Failed to follow");
        }
      }
    } catch (error) {
      console.error("Error following/unfollowing:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <Button
        disabled
        variant="outline"
        size="default"
        className={cn("w-full font-medium", className)}
      >
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (!user || user.id === sellerId) {
    return null; // Don't show button if not logged in or viewing own profile
  }

  return (
    <Button
      onClick={handleFollow}
      disabled={loading}
      variant={isFollowing ? "outline" : "default"}
      size="default"
      className={cn(
        "w-full group relative overflow-hidden transition-all duration-300 font-medium",
        isFollowing
          ? "border-gray-300 hover:border-gray-400 hover:bg-gray-50 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
          : "bg-gradient-to-r from-[#31BF75] to-[#27995E] text-white border-0 shadow-md hover:shadow-lg hover:shadow-[#31BF75]/25 hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>{isFollowing ? "Unfollowing..." : "Following..."}</span>
        </>
      ) : (
        <>
          {isFollowing ? (
            <>
              <UserCheck className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
              <span className="relative z-10">Following</span>
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-90" />
              <span className="relative z-10">Follow</span>
              {/* Shine effect on hover */}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent"></span>
            </>
          )}
        </>
      )}
    </Button>
  );
}
