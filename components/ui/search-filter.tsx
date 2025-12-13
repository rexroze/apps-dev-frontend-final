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

  // Sync with initial props when they change
  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    setCategoryId(initialCategoryId);
  }, [initialCategoryId]);

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
    const newCategoryId = value === "all" ? undefined : value;
    setCategoryId(newCategoryId);
    // Immediately call onChange for category changes (no debounce)
    onChange?.({ search: search || undefined, categoryId: newCategoryId });
  };

  return (
    <div className="flex flex-row items-center gap-2 w-full">
      <div className="relative flex-1">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-full sm:rounded-lg px-4 sm:px-5 py-2 text-sm sm:text-base min-w-0 h-10 sm:h-11 bg-white dark:bg-background dark:text-foreground border-gray-300 dark:border-border focus-visible:ring-2 focus-visible:ring-yellow-400/50 focus-visible:border-yellow-400 dark:focus-visible:border-yellow-400 shadow-sm"
        />
      </div>

      <Select
        value={selectValue}
        onValueChange={handleCategoryChange}
      >
        <SelectTrigger className="h-10 sm:h-11 w-[140px] sm:w-[180px] md:w-[200px] flex-shrink-0 text-sm bg-gray-50 dark:bg-input/30 hover:bg-gray-100 dark:hover:bg-input/50 border-gray-300 dark:border-input shadow-sm">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px] bg-white dark:bg-background dark:text-foreground z-[200]" position="popper" sideOffset={4}>
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
