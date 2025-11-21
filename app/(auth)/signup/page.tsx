import { SignupForm } from "@/components/auth/signup-form";
import { GuestRoute } from "@/components/auth/guest-route";

export default function SignupPage() {
  return (
    <GuestRoute>
      <div className="flex flex-col items-center gap-3">
        <h2 className="text-3xl font-bold text-gray-900">Create an account</h2>
        <p className="text-sm text-gray-500">Sign up to get started</p>

        {/* Form Container */}
        <SignupForm />
      </div>
    </GuestRoute>
  );
}