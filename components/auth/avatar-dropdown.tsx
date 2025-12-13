"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/contexts/auth-context";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export default function AvatarDropdown() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.avatar-dropdown-container')) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const initials = React.useMemo(() => {
    if (!user) return "U";
    const names = (user.name || "").split(" ").filter(Boolean);
    if (names.length === 0) return "U";
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }, [user]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const isDark = mounted && theme === "dark";

  return (
    <div className="relative avatar-dropdown-container">
      <button
        onClick={() => setOpen((s) => !s)}
        aria-haspopup="true"
        aria-expanded={open}
        className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-sm font-semibold hover:bg-accent transition-colors"
      >
        <span className="text-foreground">{initials}</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setOpen(false)}
          />
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="text-sm font-semibold text-foreground">{user?.name ?? "Guest"}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{user?.email ?? ""}</div>
            </div>
            <div className="p-2">
              <div className="space-y-1">
                {user ? (
                  <>
                    <Link 
                      href="/orders" 
                      className="flex items-center px-3 py-2.5 rounded-md hover:bg-accent text-foreground transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      Orders
                    </Link>
                    {/* Dark Mode Toggle */}
                    <button
                      onClick={toggleTheme}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-accent text-foreground transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        {mounted && isDark ? (
                          <Moon className="w-4 h-4 text-foreground" />
                        ) : (
                          <Sun className="w-4 h-4 text-foreground" />
                        )}
                        <span className="text-sm font-medium">Dark Mode</span>
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
                      className="w-full text-left px-3 py-2.5 rounded-md hover:bg-destructive/10 hover:text-destructive text-foreground transition-colors"
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
                    <Link 
                      href="/login" 
                      className="block px-3 py-2.5 rounded-md hover:bg-accent text-foreground transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      Login
                    </Link>
                    <Link 
                      href="/signup" 
                      className="block px-3 py-2.5 rounded-md hover:bg-accent text-foreground transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      Signup
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
