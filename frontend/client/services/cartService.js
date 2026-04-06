import { safeWarn, safeError } from "@/utils/logger";

async function safeText(res) {
  try { return await res.text(); } catch { return ""; }
}

export async function fetchCartAPI(authToken) {
  const res = await fetch("/api/cart", {
    method: "GET",
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
  });
  return res;
}

export async function deleteCartItemAPI(variantId, authToken) {
  const headers = {
    "Content-Type": "application/json",
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  };
  const res = await fetch(`/api/cart/${encodeURIComponent(variantId)}`, {
    method: "DELETE",
    headers,
    body: JSON.stringify({ variantId, quantity: 1 }),
  });
  return res;
}

export async function changeQuantityAPI(variantId, direction, authToken) {
  const headers = {
    "Content-Type": "application/json",
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  };
  const url = `/api/cart/${encodeURIComponent(variantId)}/${direction}`;
  const res = await fetch(url, { method: "POST", headers });
  return res;
}