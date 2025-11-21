import { LoginForm } from "@/components/auth/login-form";
import { GuestRoute } from "@/components/auth/guest-route";

export default function LoginPage() {
  return (
    <GuestRoute>
      <div className="flex flex-col items-center gap-3">
        <h2 className="text-3xl font-bold text-gray-900">Welcome Back!</h2>
        <p className="text-sm text-gray-500">Login to your account to continue</p>

        {/* Form Container */}
        <LoginForm />
      </div>
    </GuestRoute>
  );
}