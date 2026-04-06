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