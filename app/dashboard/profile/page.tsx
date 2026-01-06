"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import { EditProfileForm } from "@/components/profile/edit-profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/");
      return;
    }

    setLoading(false);
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Back Button */}
        <Link href="/dashboard/orders">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Profile</h1>
          <p className="text-gray-600">Update your profile information and bio</p>
        </div>

        {/* Profile Form Card */}
        <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/60 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2.5 text-xl">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#31BF75]/10 to-[#27995E]/10">
                <User className="h-5 w-5 text-[#31BF75]" />
              </div>
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <EditProfileForm
              initialBio={user.bio || null}
              initialAvatarUrl={user.avatarUrl || null}
              initialPhone={(user as any).phone || null}
              initialLocation={(user as any).location || null}
              initialWebsite={(user as any).website || null}
              initialTwitterUrl={(user as any).twitterUrl || null}
              initialLinkedinUrl={(user as any).linkedinUrl || null}
              initialFacebookUrl={(user as any).facebookUrl || null}
              initialSkills={(user as any).skills || []}
              initialLanguages={(user as any).languages || []}
              initialTimezone={(user as any).timezone || null}
              onSuccess={() => {
                // Profile updated successfully
              }}
            />
          </CardContent>
        </Card>

        {/* Account Info Card */}
        <Card className="mt-6 bg-white/90 backdrop-blur-sm border border-gray-200/60 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            <div className="flex items-center justify-between py-3 border-b border-gray-100/80 last:border-0 transition-colors hover:bg-gray-50/50 px-1 rounded">
              <span className="text-sm font-medium text-gray-600">Username</span>
              <span className="text-sm font-semibold text-gray-900">{user.username}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100/80 last:border-0 transition-colors hover:bg-gray-50/50 px-1 rounded">
              <span className="text-sm font-medium text-gray-600">Wallet Balance</span>
              <span className="text-sm font-semibold text-[#31BF75]">
                {Number(user.walletBalance).toFixed(2)} π
              </span>
            </div>
            <div className="flex items-center justify-between py-3 transition-colors hover:bg-gray-50/50 px-1 rounded">
              <span className="text-sm font-medium text-gray-600">Member Since</span>
              <span className="text-sm text-gray-900">
                {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
