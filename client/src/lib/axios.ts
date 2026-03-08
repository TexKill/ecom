import axios from "axios";
import { clientEnv } from "./env";
import { setAuthCookies, clearAuthCookies } from "./cookies";

const API_BASE_URL = clientEnv.NEXT_PUBLIC_API_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  },
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

type StoredUser = {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  token: string;
};

let refreshPromise: Promise<string | null> | null = null;

const persistAuthUser = (user: StoredUser) => {
  localStorage.setItem("user", JSON.stringify(user));

  try {
    const authRaw = localStorage.getItem("auth");
    if (authRaw) {
      const parsed = JSON.parse(authRaw);
      parsed.state = { ...(parsed.state || {}), user };
      localStorage.setItem("auth", JSON.stringify(parsed));
    }
  } catch {
    // ignore malformed auth payload
  }

  setAuthCookies(user.token, user.isAdmin);
};

const clearAuthData = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("auth");
  clearAuthCookies();
};

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

const decodeTokenExp = (token: string): number | null => {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    const payload = JSON.parse(json);
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
};

const shouldRefreshTokenSoon = (token: string, thresholdSeconds = 10 * 60) => {
  const exp = decodeTokenExp(token);
  if (!exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return exp - now <= thresholdSeconds;
};

const refreshSessionToken = async (): Promise<string | null> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const token = getTokenFromStorage();
    if (!token) return null;

    try {
      const { data } = await refreshClient.post<StoredUser>(
        "/api/users/refresh",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (data?.token) {
        persistAuthUser(data);
        return data.token;
      }
      return null;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// Automatic token injection for authenticated requests
axiosInstance.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      let token = getTokenFromStorage();
      if (token && shouldRefreshTokenSoon(token)) {
        const refreshed = await refreshSessionToken();
        if (refreshed) {
          token = refreshed;
        }
      }
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
  async (error) => {
    const originalRequest = error.config as
      | (typeof error.config & { _retry?: boolean })
      | undefined;

    const requestUrl = String(originalRequest?.url || "");
    const isAuthEndpoint =
      requestUrl.includes("/api/users/login") ||
      requestUrl.includes("/api/users/register") ||
      requestUrl.includes("/api/users/refresh");

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;
      const newToken = await refreshSessionToken();
      if (newToken) {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      }
    }

    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        clearAuthData();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
