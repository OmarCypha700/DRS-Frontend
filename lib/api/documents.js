import apiClient from "./client";

export const documentTypesApi = {
  list: () => apiClient.get("/document-types/", { params: { page_size: 100 } }),
};
