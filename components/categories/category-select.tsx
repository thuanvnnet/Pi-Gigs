"use client";

import React, { useEffect, useState } from "react";
import { getAllCategoriesFlat } from "@/app/actions/category";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  level: number;
}

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function CategorySelect({ value, onChange, error }: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const result = await getAllCategoriesFlat();
        if (result.success) {
          setCategories(result.categories || []);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  // Group categories by parent (for better UX, show hierarchy)
  const rootCategories = categories.filter((cat) => cat.parentId === null);
  const childCategories = categories.filter((cat) => cat.parentId !== null);

  // Create a map of parent -> children
  const categoryMap = new Map<number, Category[]>();
  childCategories.forEach((cat) => {
    if (cat.parentId) {
      if (!categoryMap.has(cat.parentId)) {
        categoryMap.set(cat.parentId, []);
      }
      categoryMap.get(cat.parentId)!.push(cat);
    }
  });

  return (
    <Select value={value} onValueChange={onChange} disabled={loading}>
      <SelectTrigger className={error ? "border-red-500 w-full" : "w-full"}>
        <SelectValue placeholder={loading ? "Loading categories..." : "Select a category"} />
      </SelectTrigger>
      <SelectContent>
        {rootCategories.map((category) => {
          const children = categoryMap.get(category.id) || [];
          return (
            <React.Fragment key={category.id}>
              <SelectItem value={category.id.toString()}>
                {category.name}
              </SelectItem>
              {children.map((child) => (
                <SelectItem key={child.id} value={child.id.toString()}>
                  {"  └ " + child.name}
                </SelectItem>
              ))}
            </React.Fragment>
          );
        })}
      </SelectContent>
    </Select>
  );
}
