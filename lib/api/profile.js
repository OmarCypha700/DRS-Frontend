import apiClient from "./client";

export const profileApi = {
  get: () => apiClient.get("/profile/"),
  update: (payload) => apiClient.patch("/profile/", payload),
};
