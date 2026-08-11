import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const UNSAFE_METHODS = new Set(["post", "put", "patch", "delete"]);

// The csrftoken cookie is set for the API's domain, not the frontend's —
// on a cross-site deployment (this API and this frontend are on different
// domains) document.cookie can never read it, no matter what CORS/SameSite
// allow for actual requests. So the backend hands the value back in the
// response body instead (see /auth/csrf/, /auth/login/, /auth/register/)
// and we just hold it in memory for the rest of the session.
let csrfToken = null;

export function setCsrfToken(token) {
  if (token) csrfToken = token;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  // Without this, an unreachable/hung backend leaves a request pending
  // forever — most visibly, AuthProvider's boot-time /auth/me check never
  // resolves, so isLoading never flips false and every RoleGuard-wrapped
  // page is stuck on "Checking your session…" with no way to recover short
  // of a manual reload. 30s is generous enough for slower operations
  // (registry CSV/XLSX exports) while still eventually failing loud.
  timeout: 30_000,
});

// Auth itself rides on HttpOnly access/refresh cookies the browser sends
// automatically; this header is the separate CSRF defense-in-depth layer.
apiClient.interceptors.request.use((config) => {
  const method = (config.method || "get").toLowerCase();
  if (UNSAFE_METHODS.has(method) && csrfToken) {
    config.headers["X-CSRFToken"] = csrfToken;
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
          // along with the now-invalid session. Preserve the current page
          // as `next` so LoginForm can send them back after re-authenticating.
          const next = encodeURIComponent(window.location.pathname + window.location.search);
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.href = `/login?next=${next}`;
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
