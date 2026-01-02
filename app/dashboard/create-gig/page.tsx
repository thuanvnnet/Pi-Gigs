// app/dashboard/create-gig/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { gigSchema, GigFormValues } from "@/lib/schemas";
import { createGig } from "@/app/actions/gig";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useState } from "react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Cần tạo file này nếu chưa có (dùng npx shadcn@latest add textarea)
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"; // Cần npx shadcn@latest add form
import { ImageUpload } from "@/components/gigs/image-upload";
import { Loader2 } from "lucide-react";

export default function CreateGigPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<GigFormValues>({
    resolver: zodResolver(gigSchema),
    defaultValues: {
      title: "",
      categoryId: "",
      description: "",
      basePricePi: 0,
      deliveryDays: 3,
      images: [],
    },
  });

  const onSubmit = async (data: GigFormValues) => {
    if (!user) return alert("Please login first");
    
    setLoading(true);
    try {
      const res = await createGig(data, user.id);
      if (res.success) {
        alert("Gig created successfully!");
        router.push("/"); // Sau này sẽ push về trang chi tiết Gig
        router.refresh();
      } else {
        alert(res.error);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Create a New Gig</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gig Title</FormLabel>
                <FormControl>
                  <Input placeholder="I will build a responsive website..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Images Upload */}
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gig Images</FormLabel>
                <FormControl>
                  <ImageUpload 
                    value={field.value} 
                    onChange={(urls) => field.onChange(urls)}
                    onRemove={(url) => field.onChange(field.value.filter((current) => current !== url))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category (Tạm thời là Input text, sau này thay bằng Select) */}
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter category ID (e.g. 1)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Pricing & Delivery */}
          <div className="grid grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="basePricePi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (Pi)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="100" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deliveryDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Days</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="3" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Describe your service in detail..." className="h-32" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Publish Gig
          </Button>
        </form>
      </Form>
    </div>
  );
}