import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const UNSAFE_METHODS = new Set(["post", "put", "patch", "delete"]);

function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Attach the CSRF token cookie (readable — it's intentionally not HttpOnly)
// to every unsafe request. Auth itself rides on HttpOnly access/refresh
// cookies the browser sends automatically.
apiClient.interceptors.request.use((config) => {
  const method = (config.method || "get").toLowerCase();
  if (UNSAFE_METHODS.has(method)) {
    const csrfToken = getCookie("csrftoken");
    if (csrfToken) {
      config.headers["X-CSRFToken"] = csrfToken;
    }
  }
  return config;
});

// A single in-flight refresh is shared across every request that hits a
// 401 at the same time, so a burst of parallel calls doesn't trigger a
// burst of refresh attempts.
let refreshPromise = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config: originalRequest } = error;

    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/login") || originalRequest?.url?.includes("/auth/refresh");
    // /auth/me/ is a "does a session exist?" probe — AuthProvider calls it
    // on every page load, including public ones. A 401 there just means
    // "not logged in", which is completely normal for an anonymous visitor
    // and must never force a redirect (that previously caused an infinite
    // reload loop on public pages like /register).
    const isMeEndpoint = originalRequest?.url?.includes("/auth/me");

    if (response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        refreshPromise = refreshPromise || apiClient.post("/auth/refresh/");
        await refreshPromise;
        refreshPromise = null;
        return apiClient(originalRequest);
      } catch (refreshError) {
        refreshPromise = null;
        if (!isMeEndpoint && typeof window !== "undefined") {
          // Hard redirect (not router.push): this runs outside the React
          // tree, and a full reload clears any stale client-side state
          // along with the now-invalid session.
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
