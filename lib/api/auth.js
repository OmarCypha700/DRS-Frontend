import apiClient from "./client";

export const authApi = {
  bootstrapCsrf: () => apiClient.get("/auth/csrf/"),
  login: (credentials) => apiClient.post("/auth/login/", credentials),
  register: (payload) => apiClient.post("/auth/register/", payload),
  logout: () => apiClient.post("/auth/logout/"),
  me: () => apiClient.get("/auth/me/"),
  forgotPassword: (email) => apiClient.post("/auth/password/forgot/", { email }),
  resetPassword: (payload) => apiClient.post("/auth/password/reset/", payload),
};
