// components/gigs/image-upload.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Loader2 } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  onRemove: (value: string) => void;
}

export const ImageUpload = ({ value, onChange, onRemove }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Tạo tên file unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 2. Upload lên Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("gig-images")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // 3. Lấy Public URL
      const { data } = supabase.storage
        .from("gig-images")
        .getPublicUrl(filePath);

      // 4. Trả URL về cho Form cha
      onChange([...value, data.publicUrl]);
      
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      {/* Danh sách ảnh đã upload */}
      <div className="mb-4 flex items-center gap-4">
        {value.map((url) => (
          <div key={url} className="relative w-[200px] h-[200px] rounded-md overflow-hidden border">
            <div className="z-10 absolute top-2 right-2">
              <Button type="button" onClick={() => onRemove(url)} variant="destructive" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Image fill className="object-cover" alt="Gig Image" src={url} />
          </div>
        ))}
      </div>

      {/* Nút Upload */}
      <div className="flex items-center gap-4">
        <Button
            type="button"
            variant="secondary"
            disabled={isUploading}
            // Kích hoạt input file ẩn khi click
            onClick={() => document.getElementById('file-upload')?.click()}
        >
            {isUploading ? (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                </>
            ) : (
                <>
                    <ImagePlus className="h-4 w-4 mr-2" />
                    Upload an Image
                </>
            )}
        </Button>
        <input 
            id="file-upload"
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={onUpload}
            disabled={isUploading}
        />
      </div>
    </div>
  );
};