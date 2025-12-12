import { api } from "@/lib/axios";
import { SignupSchema, LoginSchema } from "@/components/auth/schemas/validators";

export const signupService = async (data: SignupSchema) => {
  try {
    const response = await api.post("/api/auth/v1/signup", data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const loginService = async (data: LoginSchema) => {
  try {
    const response = await api.post("/api/auth/v1/login", data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const verifyEmailService = async (token: string) => {
  try {
    const response = await api.get("/api/auth/v1/verify-email", {
      params: { token },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const resendEmailVerificationService = async (email: string) => {
  try {
    const response = await api.post("/api/auth/v1/resend-email-verification", {
      email,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const refreshTokenService = async (refreshToken: string) => {
  try {
    const response = await api.post("/api/auth/v1/refresh-token", {
      refreshToken,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const initiateOAuth = (provider: "google" | "github") => {
  // Normalize API URL - remove trailing slash if present
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");
  const redirectUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/oauth-callback`
    : "";
  
  // Include redirect URL as query parameter for backend to redirect back
  // Ensure single slash between apiUrl and path
  const oauthUrl = `${apiUrl}/api/auth/v1/${provider}${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`;
  window.location.href = oauthUrl;
};

export const exchangeOAuthCode = async (code: string) => {
  try {
    const response = await api.get("/api/auth/v1/oauth/exchange", {
      params: { code },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};