"use client";

import Link from "next/link";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Eye, EyeOff } from "lucide-react";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";

import { loginValidator, LoginSchema } from "@/components/auth/schemas/validators";
import { loginService } from "@/services/auth";
import { toast } from "sonner";
import { apiErrorHandler } from "@/lib/axios";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { getRedirectPathByRole } from "@/lib/auth-utils";
import { useAuth } from "@/components/auth/contexts/auth-context";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginValidator),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle form submission
  async function onSubmit(values: LoginSchema) {
    try {
      const response = await loginService(values);
      
      if (response.status === "success" && response.data) {
        // Use context login to update global state
        if (response.data.tokens && response.data.user) {
          login(response.data.user, {
            accessToken: response.data.tokens.accessToken,
            refreshToken: response.data.tokens.refreshToken,
          });
        }

        toast.success(response.message || "Login successful");
        
        // Redirect based on user role
        const redirectPath = getRedirectPathByRole(response.data.user);
        router.push(redirectPath);
        form.reset();
      }
      
    } catch (error: unknown) {
      toast.error(apiErrorHandler(error as AxiosError).message ?? "Unknown error");
      return;
    }
  }

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* Password Field */}
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} placeholder="Password" {...field} />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* Submit Button */}
          <Button disabled={form.formState.isSubmitting} type="submit" className="w-full" size="lg">
            {form.formState.isSubmitting ? (
              <>
                <Spinner />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>

          <div className="flex items-center justify-center">
            <p className="text-sm text-gray-500">
              Don't have an account? {` `}
              <Link href="/signup" className="text-primary underline-offset-4 hover:underline">Sign up</Link>
            </p>
          </div>

          <Separator />
          <div className="flex items-center justify-center">
            <p className="text-sm text-gray-500">Or continue with</p>
          </div>
          <OAuthButtons />
        </form>
      </Form>
    </div>
  );
}