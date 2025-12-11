"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  href?: string; // where to navigate when clicked; defaults to router.back()
  label?: string; // label for the button
  crumbs?: string[]; // optional breadcrumb parts to display (e.g., ['Store','Orders'])
  className?: string;
}

export default function BreadcrumbBack({ href, label = "Back", crumbs, className = "" }: Props) {
  const router = useRouter();

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (href) router.push(href);
    else router.back();
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Button
        variant="outline"
        className={`group mt-0 inline-flex items-center gap-2`}
        size="sm"
        onClick={onClick}
      >
        <span className="transform transition-transform duration-150 group-hover:-translate-x-1">
          <ArrowLeft className="w-4 h-4" />
        </span>
        <span className="text-sm font-medium">{label}</span>
      </Button>

      {crumbs && crumbs.length > 0 && (
        <nav aria-label="breadcrumb" className="text-sm text-gray-400">
          {crumbs.map((c, idx) => (
            <span key={idx} className="inline-flex items-center">
              <span className={idx === crumbs.length - 1 ? "text-gray-600 font-medium" : ""}>{c}</span>
              {idx < crumbs.length - 1 && <span className="mx-2">/</span>}
            </span>
          ))}
        </nav>
      )}
    </div>
  );
}
