import axios, { AxiosError } from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  withCredentials: true,
});

export const apiErrorHandler = (error: AxiosError) => {
  if (error instanceof AxiosError) {
    return error.response?.data as { message: string };
  }
  return { message: "Unknown error" } as { message: string };
};