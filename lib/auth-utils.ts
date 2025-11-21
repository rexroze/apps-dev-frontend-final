import { User } from "@/types/auth";

/**
 * Get redirect path based on user role
 */
export function getRedirectPathByRole(user: User | null): string {
  if (!user) return "/login";

  switch (user.role.toUpperCase()) {
    case "ADMIN":
      return "/admin/products";
    case "USER":
      return "/products";
    default:
      return "/";
  }
}