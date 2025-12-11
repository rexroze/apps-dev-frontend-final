"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  initialSearch?: string;
  initialCategoryId?: string;
  onChange?: (opts: { search?: string; categoryId?: string }) => void;
  redirectToStore?: boolean; // when true, navigating search will push to /store with query params
}

export function SearchFilter({ initialSearch = "", initialCategoryId, onChange, redirectToStore = true }: Props) {
  const [search, setSearch] = useState(initialSearch);
  const [categoryId, setCategoryId] = useState<string | undefined>(initialCategoryId);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  // Fetch categories once
  useEffect(() => {
    let mounted = true;
    api
      .get("/api/category/v1/categories")
      .then((res) => {
        if (!mounted) return;
        if (res?.data?.status === "success" && Array.isArray(res.data.data)) {
          setCategories(res.data.data);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const router = useRouter();

  // Convert categoryId to Select value (use "all" for undefined/empty)
  const selectValue = categoryId || "all";

  // Debounce search updates
  useEffect(() => {
    const t = setTimeout(() => {
      const opts = { search: search || undefined, categoryId };
      onChange?.(opts);
      // Only redirect to /store when there is an actual filter value
      if (redirectToStore && (opts.search || opts.categoryId)) {
        const params = new URLSearchParams();
        if (opts.search) params.set("search", opts.search);
        if (opts.categoryId) params.set("categoryId", opts.categoryId);
        const qs = params.toString();
        router.push(`/store${qs ? `?${qs}` : ""}`);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [search, categoryId, onChange, redirectToStore, router]);

  const handleCategoryChange = (value: string) => {
    // Convert "all" back to undefined
    setCategoryId(value === "all" ? undefined : value);
  };

  return (
    <div className="flex flex-row items-center gap-2 w-full">
      <Input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 bg-white rounded-full sm:rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base min-w-0 h-9"
      />

      <Select
        value={selectValue}
        onValueChange={handleCategoryChange}
      >
        <SelectTrigger className="bg-white border-gray-300 focus:ring-2 focus:ring-yellow-500 h-9 w-[120px] sm:w-[160px] md:w-[180px] flex-shrink-0 text-sm">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default SearchFilter;
