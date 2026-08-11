import apiClient from "./client";
import { triggerDownload } from "./download";

export const registryApplicationsApi = {
  list: (params) => apiClient.get("/registry/applications/", { params }),
  get: (id) => apiClient.get(`/registry/applications/${id}/`),
  updateStatus: (id, payload) => apiClient.post(`/registry/applications/${id}/status/`, payload),
  bulkUpdateStatus: (payload) => apiClient.post("/registry/applications/bulk-status/", payload),

  /** Downloads either the given `ids` or, if omitted, everything matching `filterParams`. */
  async export({ ids, filterParams, fileType }) {
    const params = ids?.length ? { ids: ids.join(","), file_type: fileType } : { ...filterParams, file_type: fileType };
    const response = await apiClient.get("/registry/applications/export/", { params, responseType: "blob" });
    triggerDownload(response.data, `applications.${fileType}`);
  },
};
