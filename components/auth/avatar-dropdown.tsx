"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/contexts/auth-context";
import { Button } from "@/components/ui/button";

export default function AvatarDropdown() {
  const { user, logout } = useAuth();
  const [open, setOpen] = React.useState(false);

  const initials = React.useMemo(() => {
    if (!user) return "U";
    const names = (user.name || "").split(" ").filter(Boolean);
    if (names.length === 0) return "U";
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }, [user]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((s) => !s)}
        aria-haspopup="true"
        aria-expanded={open}
        className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-sm font-semibold border"
      >
        {user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt={user.name || "avatar"} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border rounded-md shadow-md z-50">
          <div className="p-3 border-b">
            <div className="text-sm font-medium">{user?.name ?? "Guest"}</div>
            <div className="text-xs text-gray-500">{user?.email ?? ""}</div>
          </div>
          <div className="p-2">
            <div className="space-y-1">
              {user ? (
                <>
                  <Link href="/orders" className="block px-3 py-2 rounded hover:bg-gray-100">Orders</Link>
                  <button
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-100"
                    onClick={() => {
                      setOpen(false);
                      logout();
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block px-3 py-2 rounded hover:bg-gray-100">Login</Link>
                  <Link href="/signup" className="block px-3 py-2 rounded hover:bg-gray-100">Signup</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
