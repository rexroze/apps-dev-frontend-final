"use client";

import * as React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Package, Settings, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/contexts/auth-context";
import { useTheme } from "next-themes";
import Link from "next/link";

export function UserMenu() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!isAuthenticated || !user) {
    return (
      <Link href="/login">
        <Button variant="outline" size="sm">
          Login
        </Button>
      </Link>
    );
  }

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const isDark = mounted && theme === "dark";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
      >
        <Avatar className="h-8 w-8 cursor-pointer border-2 border-yellow-500 dark:border-yellow-400 hover:border-yellow-400 dark:hover:border-yellow-300 transition-colors">
          <AvatarFallback className="bg-yellow-500 dark:bg-yellow-600 text-green-900 dark:text-green-950 font-semibold">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg bg-card border border-border z-50 overflow-hidden">
            <div className="py-1">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-foreground">{user.name || "User"}</p>
                {user.email && (
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                )}
              </div>
              <Link
                href="/orders"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors"
              >
                <Package className="w-4 h-4" />
                Order History
              </Link>
              {user.role?.toUpperCase() === "ADMIN" && (
                <Link
                  href="/admin/products"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Admin
                </Link>
              )}
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors group"
              >
                <div className="flex items-center gap-3">
                  {mounted && isDark ? (
                    <Moon className="w-4 h-4 text-foreground" />
                  ) : (
                    <Sun className="w-4 h-4 text-foreground" />
                  )}
                  <span className="font-medium">Dark Mode</span>
                </div>
                <div className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
                  isDark ? 'bg-primary' : 'bg-muted'
                }`}>
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-background rounded-full shadow-lg transform transition-transform duration-300 ease-in-out flex items-center justify-center ${
                      isDark ? "translate-x-5" : "translate-x-0"
                    }`}
                  >
                    {mounted && (
                      <>
                        {isDark ? (
                          <Moon className="w-3 h-3 text-primary" />
                        ) : (
                          <Sun className="w-3 h-3 text-muted-foreground" />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </button>
              <div className="border-t border-border my-1" />
              <button
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

