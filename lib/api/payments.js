import apiClient from "./client";

export const paymentsApi = {
  initialize: (applicationId) => apiClient.post("/payments/initialize/", { application_id: applicationId }),
  verify: (reference) => apiClient.get(`/payments/verify/${reference}/`),
};
