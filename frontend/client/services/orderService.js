import { handleApiError } from "@/utils/errorMessages";

export async function createOrderAPI(orderData, authToken) {
  const headers = {
    "Content-Type": "application/json",
  };
  if (authToken && authToken !== "guest") {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch("/api/orders", {
    method: "POST",
    headers,
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const errorMessage = await handleApiError(response, "оформление заказа", "заказ");
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function fetchUserOrders() {
  const token = getAuthToken();
  if (!token || token === "guest") throw new Error("UNAUTHORIZED");
  const res = await fetch("/api/orders/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchOrderDetails(orderId) {
  const token = getAuthToken();
  if (!token || token === "guest") throw new Error("UNAUTHORIZED");
  const res = await fetch(`/api/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}