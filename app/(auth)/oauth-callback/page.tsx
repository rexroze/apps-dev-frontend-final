"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { exchangeOAuthCode } from "@/services/auth";
import { toast } from "sonner";
import { apiErrorHandler } from "@/lib/axios";
import { AxiosError } from "axios";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getRedirectPathByRole } from "@/lib/auth-utils";
import { useAuth } from "@/components/auth/contexts/auth-context";

export default function OAuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");
      const statusParam = searchParams.get("status");

      // Handle error case
      if (error || statusParam === "error") {
        const errorMessage = searchParams.get("message") || error || "OAuth authentication failed";
        setStatus("error");
        setMessage(errorMessage);
        toast.error(errorMessage);
        router.push(`/login?error=${encodeURIComponent(errorMessage)}`);
        return;
      }

      // Exchange code for tokens
      if (code) {
        try {
          const response = await exchangeOAuthCode(code);

          if (response.status === "success" && response.data) {
            // Use context login to update global state
            if (response.data.tokens && response.data.user) {
              login(response.data.user, {
                accessToken: response.data.tokens.accessToken,
                refreshToken: response.data.tokens.refreshToken,
              });
            }

            setStatus("success");
            setMessage(response.message || "Authentication successful!");
            toast.success(response.message || "Authentication successful!");

            // Redirect based on user role
            const redirectPath = getRedirectPathByRole(response.data.user);
            setTimeout(() => {
              router.push(redirectPath);
            }, 1500);
          } else {
            throw new Error(response.message || "Authentication failed");
          }
        } catch (error) {
          const errorMessage = apiErrorHandler(error as AxiosError).message || "Failed to complete authentication";
          setStatus("error");
          setMessage(errorMessage);
          toast.error(errorMessage);
          router.push(`/login?error=${encodeURIComponent(errorMessage)}`);
        }
      } else {
        // No code - show error
        const errorMessage = "Invalid OAuth callback. Missing authentication code.";
        setStatus("error");
        setMessage(errorMessage);
        toast.error(errorMessage);
        router.push(`/login?error=${encodeURIComponent(errorMessage)}`);
      }
    };

    processCallback();
  }, [searchParams, router]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-[400px]">
        <Spinner className="w-8 h-8" />
        <p className="text-sm text-gray-600">Completing authentication...</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 max-w-md text-center">
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Authentication Successful!</h2>
        <p className="text-sm text-gray-600">{message}</p>
        <p className="text-sm text-gray-500">Redirecting to home page...</p>
        <Link href="/">
          <Button size="lg">Go to Home</Button>
        </Link>
      </div>
    );
  }

  // Error state
  return (
    <div className="flex flex-col items-center gap-4 max-w-md text-center">
      <div className="rounded-full bg-red-100 p-3">
        <XCircle className="h-8 w-8 text-red-600" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900">Authentication Failed</h2>
      <p className="text-sm text-gray-600">{message}</p>
      <div className="flex gap-2">
        <Link href="/login">
          <Button variant="outline" size="lg">Back to Login</Button>
        </Link>
        <Link href="/signup">
          <Button size="lg">Try Signup</Button>
        </Link>
      </div>
    </div>
  );
}