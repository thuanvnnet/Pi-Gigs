"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImagePlus, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  username: string;
  className?: string;
}

export function AvatarUpload({ value, onChange, username, className }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be less than 2MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    setIsUploading(true);
    try {
      // 1. Tạo tên file unique
      const fileExt = file.name.split('.').pop();
      const fileName = `avatars/${Date.now()}-${Math.random()}.${fileExt}`;

      // 2. Upload lên Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("gig-images") // Có thể tạo bucket riêng cho avatars sau
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // 3. Lấy Public URL
      const { data } = supabase.storage
        .from("gig-images")
        .getPublicUrl(fileName);

      // 4. Trả URL về cho Form cha
      onChange(data.publicUrl);
      
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(error.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-5", className)}>
      {/* Avatar Preview */}
      <div className="relative group">
        <Avatar className="h-28 w-28 sm:h-36 sm:w-36 border-4 border-white shadow-xl ring-2 ring-gray-100 transition-all duration-300 group-hover:ring-[#31BF75]/30">
          <AvatarImage src={value || ""} alt={username} className="object-cover" />
          <AvatarFallback className="bg-gradient-to-br from-[#31BF75] via-[#2BA866] to-[#27995E] text-white text-3xl sm:text-4xl font-bold">
            {username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="Remove avatar"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {/* Overlay on hover */}
        <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
          <ImagePlus className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
      </div>

      {/* Upload Button */}
      <div className="flex flex-col items-center gap-2.5 w-full">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => document.getElementById('avatar-upload')?.click()}
          className="flex items-center gap-2 border-gray-200 hover:border-[#31BF75] hover:text-[#31BF75] transition-colors"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <ImagePlus className="h-4 w-4" />
              {value ? "Change Photo" : "Upload Photo"}
            </>
          )}
        </Button>
        <p className="text-xs text-gray-400 text-center">
          JPG, PNG or GIF • Max 2MB
        </p>
        <input 
          id="avatar-upload"
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={onUpload}
          disabled={isUploading}
        />
      </div>
    </div>
  );
}
