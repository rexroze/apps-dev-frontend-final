"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, FolderTree, BarChart3, Store } from "lucide-react";
import { UserMenu } from "@/components/ui/user-menu";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const navigation = [
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: FolderTree },
  { name: "Sales", href: "/admin/sales", icon: BarChart3 },
];

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-50">
        <div className="flex flex-col flex-grow bg-green-900 pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <Link href="/store" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center group-hover:bg-yellow-400 transition-colors">
                <Store className="w-6 h-6 text-green-900" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-yellow-500 group-hover:text-yellow-400 transition-colors">
                  TechCraftersHQ
                </span>
                <span className="text-xs text-green-300">Admin Panel</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-yellow-500 text-green-900 shadow-md"
                      : "text-green-100 hover:bg-green-800 hover:text-yellow-400"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-green-900" : "text-green-300")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Mobile Header */}
        <header className="lg:hidden bg-green-900 shadow-sm border-b sticky top-0 z-40">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <Link href="/store" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <Store className="w-5 h-5 text-green-900" />
                </div>
                <span className="text-lg font-bold text-yellow-500">TechCraftersHQ</span>
              </Link>
              <UserMenu />
            </div>
            <h1 className="text-lg font-semibold text-white mt-2">{title}</h1>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:block bg-green-900 shadow-sm border-b">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-yellow-500">{title}</h1>
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Footer Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
        <div className="grid grid-cols-3 h-16">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 transition-all duration-200 relative",
                  isActive
                    ? "text-green-900 bg-green-50"
                    : "text-gray-600 hover:text-green-900 hover:bg-gray-50"
                )}
              >
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-green-900" />
                )}
                <item.icon 
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-green-900" : "text-gray-600"
                  )} 
                />
                <span className={cn(
                  "text-xs font-medium transition-colors",
                  isActive ? "text-green-900 font-semibold" : "text-gray-600"
                )}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer for mobile footer */}
      <div className="lg:hidden h-16" />
    </div>
  );
}

