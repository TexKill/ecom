import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000",
  headers: {
    "Content-Type": "application/json",
  },
});

const getTokenFromStorage = (): string | null => {
  const legacyUser = localStorage.getItem("user");
  if (legacyUser) {
    try {
      const parsed = JSON.parse(legacyUser);
      if (parsed?.token) return parsed.token;
    } catch {
      // ignore invalid payload
    }
  }

  const authState = localStorage.getItem("auth");
  if (authState) {
    try {
      const parsed = JSON.parse(authState);
      const token = parsed?.state?.user?.token;
      if (token) return token;
    } catch {
      // ignore invalid payload
    }
  }

  return null;
};

// Automatic token injection for authenticated requests
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = getTokenFromStorage();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Automatic logout on 401 Unauthorized response
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("auth");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
