"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Mail } from "lucide-react";
import Link from "next/link";
import { resendEmailVerificationService } from "@/services/auth";
import { apiErrorHandler } from "@/lib/axios";
import { AxiosError } from "axios";
import { toast } from "sonner";

type VerificationStatus = "instruction" | "success" | "error";

interface VerifyEmailProps {
  email?: string;
  verificationStatus: VerificationStatus;
  message?: string;
}

export function VerifyEmail({ email, verificationStatus, message }: VerifyEmailProps) {
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    if (!email) {
      toast.error("Email address is required to resend verification link");
      return;
    }

    setIsResending(true);
    try {
      const response = await resendEmailVerificationService(email);
      toast.success(response.message || "Verification email sent successfully!");
    } catch (error) {
      const errorMessage = apiErrorHandler(error as AxiosError).message || "Failed to resend verification email";
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };
  if (verificationStatus === "success") {
    return (
      <div className="flex flex-col items-center gap-4 max-w-md text-center">
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Email Verified!</h2>
        <p className="text-sm text-gray-600">{message || "Your email has been successfully verified."}</p>
        <Link href="/login">
          <Button size="lg">Continue to Login</Button>
        </Link>
      </div>
    );
  }

  if (verificationStatus === "error") {
    return (
      <div className="flex flex-col items-center gap-4 max-w-md text-center">
        <div className="rounded-full bg-red-100 p-3">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Verification Failed</h2>
        <p className="text-sm text-gray-600">{message || "The verification link is invalid or has expired."}</p>
        <div className="flex gap-2">
          <Link href="/signup">
            <Button variant="outline" size="lg">Back to Signup</Button>
          </Link>
          <Button size="lg" onClick={handleResend} disabled={isResending || !email}>
            {isResending ? "Sending..." : "Resend Verification Link"}
          </Button>
        </div>
      </div>
    );
  }

  // Instruction view
  return (
    <div className="flex flex-col items-center gap-4 max-w-md text-center">
      <div className="rounded-full bg-blue-100 p-3">
        <Mail className="h-8 w-8 text-blue-600" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900">Verify Your Email</h2>
      {email && (
        <>
          <p className="text-sm text-gray-500">
            We've sent a verification link to
          </p>
          <p className="text-sm text-gray-900 font-medium">{email}</p>
        </>
      )}
      <p className="text-sm text-gray-500">
        Please check your email and click the verification link to complete your registration.
      </p>
      <div className="flex gap-2 mt-2">
        <Button 
          variant="outline" 
          size="lg" 
          onClick={handleResend} 
          disabled={isResending || !email}
        >
          {isResending ? "Sending..." : "Resend Verification Link"}
        </Button>
        <Link href="/login">
          <Button variant="ghost" size="lg">Back to Login</Button>
        </Link>
      </div>
    </div>
  );
}