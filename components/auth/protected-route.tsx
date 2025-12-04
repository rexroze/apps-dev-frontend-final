"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/contexts/auth-context";
import { Spinner } from "@/components/ui/spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole,
  redirectTo = "/login" 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.push(redirectTo);
        return;
      }

      // Check role if required
      if (requiredRole && user.role.toUpperCase() !== requiredRole.toUpperCase()) {
        // Redirect based on user's actual role
        if (user.role.toUpperCase() === "ADMIN") {
          router.push("/admin/products");
        } else {
          router.push("/store");
        }
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, requiredRole, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Check role if required
  if (requiredRole && user.role.toUpperCase() !== requiredRole.toUpperCase()) {
    return null;
  }

  return <>{children}</>;
}