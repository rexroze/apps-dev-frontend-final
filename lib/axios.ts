/*
Note by Ariel Batoon
This file is used to create a axios instance and add interceptors to the instance.
The interceptors are used to add the access token to the request headers and refresh the access token if it is expired.
The refresh token is used to refresh the access token if it is expired.
The access token is stored in the localStorage.
The refresh token is stored in the localStorage.
The user is stored in the localStorage.
The api is used to make the requests to the backend.
*/

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Normalize API URL - remove trailing slash if present
const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");

export const api = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Add request interceptor to include access token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      if (typeof window !== "undefined") {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          // No refresh token, clear everything
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          processQueue(error, null);
          isRefreshing = false;
          
          // Only redirect to login for protected routes, not public routes like /store
          const publicRoutes = ["/store", "/", "/login", "/signup"];
          const isPublicRoute = publicRoutes.some(route => window.location.pathname.startsWith(route));
          
          if (!isPublicRoute && window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
          return Promise.reject(error);
        }

        try {
          // Make direct axios call to avoid interceptor loop
          // Using a fresh axios instance without interceptors
          const refreshResponse = await axios.post(
            `${api.defaults.baseURL}/api/auth/v1/refresh-token`,
            { refreshToken },
            {
              headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
              },
              withCredentials: true,
            }
          );

          const responseData = refreshResponse.data;

          if (responseData.status === "success" && responseData.data?.tokens) {
            const newAccessToken = responseData.data.tokens.accessToken;
            const newRefreshToken = responseData.data.tokens.refreshToken;

            // Update tokens in localStorage
            localStorage.setItem("accessToken", newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem("refreshToken", newRefreshToken);
            }

            // Update the original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }

            processQueue(null, newAccessToken);
            isRefreshing = false;

            // Retry the original request
            return api(originalRequest);
          } else {
            throw new Error("Invalid refresh token response");
          }
        } catch (refreshError) {
          // Refresh failed, clear tokens
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          processQueue(refreshError as AxiosError, null);
          isRefreshing = false;

          // Only redirect to login for protected routes, not public routes like /store
          if (typeof window !== "undefined") {
            const publicRoutes = ["/store", "/", "/login", "/signup"];
            const isPublicRoute = publicRoutes.some(route => window.location.pathname.startsWith(route));
            
            if (!isPublicRoute && window.location.pathname !== "/login") {
              window.location.href = "/login";
            }
          }

          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export const apiErrorHandler = (error: AxiosError) => {
  if (error instanceof AxiosError) {
    return error.response?.data as { message: string };
  }
  return { message: "Unknown error" } as { message: string };
};