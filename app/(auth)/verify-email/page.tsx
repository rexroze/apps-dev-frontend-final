import { redirect } from "next/navigation";
import { VerifyEmail } from "@/components/auth/verify-email";
import { verifyEmailService } from "@/services/auth";
import { apiErrorHandler } from "@/lib/axios";
import { AxiosError } from "axios";

interface VerifyEmailPageProps {
  searchParams: Promise<{ email?: string; token?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams;
  const email = params.email;
  const token = params.token;

  // If token is provided, verify the email
  if (token) {
    try {
      const response = await verifyEmailService(token);
      return (
        <div className="flex flex-col items-center gap-3">
          <VerifyEmail 
            email={email} 
            verificationStatus="success" 
            message={response.message || "Email verified successfully!"}
          />
        </div>
      );
    } catch (error) {
      const errorMessage = apiErrorHandler(error as AxiosError).message || "Verification failed. Please try again.";
      return (
        <div className="flex flex-col items-center gap-3">
          <VerifyEmail 
            email={email} 
            verificationStatus="error" 
            message={errorMessage}
          />
        </div>
      );
    }
  }

  // If no token but email is provided, show instructions
  if (email) {
    return (
      <div className="flex flex-col items-center gap-3">
        <VerifyEmail email={email} verificationStatus="instruction" />
      </div>
    );
  }

  redirect("/signup");
}