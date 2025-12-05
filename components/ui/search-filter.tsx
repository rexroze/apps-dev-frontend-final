"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/axios";

import { useRouter } from "next/navigation";

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
      .get("/category/v1/categories")
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
  }, [search, categoryId, onChange]);

  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xl bg-white rounded-full m-4 p-4"
      />

      <select
        value={categoryId ?? ""}
        onChange={(e) => setCategoryId(e.target.value || undefined)}
        className="rounded-md bg-white p-2 text-sm"
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SearchFilter;
