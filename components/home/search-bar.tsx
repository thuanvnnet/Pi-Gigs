// components/home/search-bar.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto mb-6"
      role="search"
      aria-label="Search for gigs"
    >
      <div className="flex gap-3 bg-white border-2 border-gray-200 rounded-lg shadow-lg p-2 hover:border-green-500 transition-colors focus-within:border-green-500">
        <label htmlFor="search-input" className="sr-only">
          Search for gigs
        </label>
        <Search
          className="h-5 w-5 text-gray-400 my-auto ml-4"
          aria-hidden="true"
        />
        <input
          id="search-input"
          type="search"
          placeholder="What are you looking for today?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-2 py-4 text-base text-gray-900 outline-none bg-transparent"
          aria-label="Search input"
        />
        <Button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 h-auto font-semibold rounded-md"
          aria-label="Submit search"
        >
          Search
        </Button>
      </div>
    </form>
  );
}

