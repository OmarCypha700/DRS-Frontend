import apiClient from "./client";

export const notificationsApi = {
  list: (params) => apiClient.get("/notifications/", { params }),
  unreadCount: () => apiClient.get("/notifications/unread-count/"),
  markRead: (id) => apiClient.post(`/notifications/${id}/read/`),
  markAllRead: () => apiClient.post("/notifications/mark-all-read/"),
  subscribePush: (subscription) => apiClient.post("/notifications/push-subscriptions/", subscription),
  unsubscribePush: (endpoint) => apiClient.delete("/notifications/push-subscriptions/", { data: { endpoint } }),
};
