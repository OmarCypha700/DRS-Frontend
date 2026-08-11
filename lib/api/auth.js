import apiClient, { setCsrfToken } from "./client";

// login/register/bootstrapCsrf all mint or rotate the CSRF token server-side
// and return it in the body — capture it here so every caller gets the
// in-memory store kept in sync without having to remember to do it themselves.
async function withCsrfCapture(request) {
  const response = await request();
  setCsrfToken(response.data?.csrfToken);
  return response;
}

export const authApi = {
  bootstrapCsrf: () => withCsrfCapture(() => apiClient.get("/auth/csrf/")),
  login: (credentials) => withCsrfCapture(() => apiClient.post("/auth/login/", credentials)),
  register: (payload) => withCsrfCapture(() => apiClient.post("/auth/register/", payload)),
  logout: () => apiClient.post("/auth/logout/"),
  me: () => apiClient.get("/auth/me/"),
  forgotPassword: (email) => apiClient.post("/auth/password/forgot/", { email }),
  resetPassword: (payload) => apiClient.post("/auth/password/reset/", payload),
};
