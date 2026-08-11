import apiClient from "./client";

export const applicationsApi = {
  list: (params) => apiClient.get("/applications/", { params }),
  get: (id) => apiClient.get(`/applications/${id}/`),
  create: (payload) => apiClient.post("/applications/", payload),
  update: (id, payload) => apiClient.patch(`/applications/${id}/`, payload),
  submit: (id) => apiClient.post(`/applications/${id}/submit/`),
  remove: (id) => apiClient.delete(`/applications/${id}/`),
};
