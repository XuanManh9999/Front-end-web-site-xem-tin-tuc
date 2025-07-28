import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

// Constants
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const API_BASE_URL = `${BASE_URL}/api/v1`;
const TOKEN_EXPIRY = 1 / 24; // 1 giờ
const AUTH_ERROR_MESSAGE = "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.";
const SIGNIN_PATH = "/signin";

// Axios instance
const configApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000, // 20 giây
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token refresh state
let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 giây

const retryRequest = async (config: AxiosRequestConfig, retries = MAX_RETRIES): Promise<AxiosResponse> => {
  try {
    return await configApi(config);
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return retryRequest(config, retries - 1);
    }
    throw error;
  }
};

// Utility functions
const isValidToken = (token: string | undefined): boolean => {
  return token !== undefined && typeof token === "string" && token.length > 0;
};

const handleLogout = (message = AUTH_ERROR_MESSAGE): void => {
  // Clear all storage
  localStorage.clear();
  sessionStorage.clear();
  Cookies.remove("accessTokenAdmin");
  Cookies.remove("refreshTokenAdmin");
  
  // Redirect to signin
  window.location.href = SIGNIN_PATH;
  
  // Show message (better than alert)
  console.warn(message);
};

const isTokenExpired = (error: AxiosError): boolean => {
  return (
    error.response?.status === 401 &&
    ((error.response?.data as any)?.error === "JWT expired" ||
      (error.response?.data as any)?.message === "JWT expired" ||
      (error.response?.data as any)?.message?.includes("expired"))
  );
};

// Request interceptor
configApi.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get("accessTokenAdmin");
    if (isValidToken(token)) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
configApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = Cookies.get("refreshTokenAdmin");
      if (!refreshToken) {
        handleLogout();
        return Promise.reject(error);
      }

      // Remove expired access token
      Cookies.remove("accessTokenAdmin");

      // If already refreshing, queue the request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axios(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const res = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          {
            headers: {
              "x-token": refreshToken,
            },
            timeout: 10000, // 10 seconds timeout for refresh
          }
        );

        if (res.status !== 200) {
          throw new Error("Không nhận được access token mới");
        }

        const newAccessToken = res.data?.accessToken;
        if (!newAccessToken) {
          throw new Error("Không nhận được access token mới");
        }

        // Set new access token
        Cookies.set("accessTokenAdmin", newAccessToken, {
          sameSite: "Lax", // Changed from None for better compatibility
          secure: window.location.protocol === 'https:',
          expires: TOKEN_EXPIRY,
        });

        // Update original request headers
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        // Process queued requests
        processQueue(null, newAccessToken);
        
        // Retry original request
        return axios(originalRequest);
      } catch (refreshErr: any) {
        // Process queued requests with error
        processQueue(refreshErr, null);
        
        // Logout on refresh failure
        handleLogout();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    if (error.response?.status === 403) {
      console.warn("Access forbidden");
    } else if (error.response?.status && error.response.status >= 500) {
      console.error("Server error:", error.response?.data);
    }

    return Promise.reject(error);
  }
);

export { configApi };
