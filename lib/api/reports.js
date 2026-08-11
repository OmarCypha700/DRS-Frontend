import apiClient from "./client";
import { triggerDownload } from "./download";

export const reportsApi = {
  summary: (params) => apiClient.get("/registry/applications/reports/summary/", { params }),

  async export(params, fileType) {
    const response = await apiClient.get("/registry/applications/reports/export/", {
      params: { ...params, file_type: fileType },
      responseType: "blob",
    });
    triggerDownload(response.data, `report_summary.${fileType}`);
  },
};
