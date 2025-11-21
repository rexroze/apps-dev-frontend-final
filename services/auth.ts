import { api } from "@/lib/axios";
import { SignupSchema } from "@/components/auth/schemas/validators";

export const signupService = async (data: SignupSchema) => {
  try {
    const response = await api.post("/api/auth/v1/signup", data);
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