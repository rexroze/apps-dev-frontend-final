import { api } from "./axios";

/**
 * SWR fetcher function that uses our axios instance
 * This ensures all requests go through our interceptors (auth, refresh token, etc.)
 */
export const swrFetcher = async (url: string, options?: { method?: string; data?: any }) => {
  const method = options?.method || "GET";
  
  if (method === "GET") {
    const response = await api.get(url);
    return response.data;
  } else if (method === "POST") {
    const response = await api.post(url, options?.data);
    return response.data;
  } else if (method === "PUT") {
    const response = await api.put(url, options?.data);
    return response.data;
  } else if (method === "DELETE") {
    const response = await api.delete(url);
    return response.data;
  }
  
  throw new Error(`Unsupported method: ${method}`);
};

